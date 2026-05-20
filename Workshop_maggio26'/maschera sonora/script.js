class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.smoothVolume = 0;
    this.alpha = 0.3;
    this.stream = null;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  getVolume() {
    if (!this.analyser) return 0;
    this.analyser.getByteTimeDomainData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const val = (this.dataArray[i] - 128) / 128;
      sum += val * val;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    this.smoothVolume = this.alpha * rms + (1 - this.alpha) * this.smoothVolume;
    return this.smoothVolume;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

class InterpolationEngine {
  constructor(svgElement) {
    this.svg = svgElement;
    this.morphs = [];
  }

  elementToPath(el) {
    if (el.tagName === 'circle') {
      const cx = parseFloat(el.getAttribute('cx'));
      const cy = parseFloat(el.getAttribute('cy'));
      const r = parseFloat(el.getAttribute('r'));
      const k = 0.5523;
      return `M${cx-r},${cy}C${cx-r},${cy-r*k},${cx-r*k},${cy-r},${cx},${cy-r}C${cx+r*k},${cy-r},${cx+r},${cy-r*k},${cx+r},${cy}C${cx+r},${cy+r*k},${cx+r*k},${cy+r},${cx},${cy+r}C${cx-r*k},${cy+r},${cx-r},${cy+r*k},${cx-r},${cy}Z`;
    }
    if (el.tagName === 'polygon') {
      const points = el.getAttribute('points');
      if (!points) return '';
      const coords = points.trim().split(/[\s,]+/).map(Number);
      if (coords.length < 2) return '';
      let d = `M${coords[0]},${coords[1]}`;
      for (let i = 2; i < coords.length; i += 2) {
        d += `L${coords[i]},${coords[i+1]}`;
      }
      d += 'Z';
      return d;
    }
    return el.getAttribute('d') || '';
  }

  loadStates(silenceSVGString, speakSVGString) {
    const parser = new DOMParser();
    const sDoc = parser.parseFromString(silenceSVGString, 'image/svg+xml');
    const pDoc = parser.parseFromString(speakSVGString, 'image/svg+xml');

    const pairs = [
      ['bocca', 'bocca_fuori'],
      ['bocca_dentro', 'bocca_dentro'],
      ['farfallino', 'farfallino'],
      ['guance', 'guance'],
      ['sopracciglia', 'sopracciglia'],
      ['Naso', 'Naso'],
      ['linea_naso', 'linea_naso'],
      ['occhi', 'occhi'],
    ];

    for (const [sId, pId] of pairs) {
      const sg = sDoc.querySelector(`#${sId}`);
      const pg = pDoc.querySelector(`#${pId}`);
      if (!sg || !pg) continue;

      const sEls = sg.querySelectorAll('path, polygon, circle');
      const pEls = pg.querySelectorAll('path, polygon, circle');

      let dg = this.svg.querySelector(`#${sId}`);
      if (!dg) continue;

      const maxLen = Math.max(sEls.length, pEls.length);

      for (let i = 0; i < maxLen; i++) {
        const se = sEls[i];
        const pe = pEls[i];
        if (!se || !pe) continue;

        const pathA = this.elementToPath(se);
        const pathB = this.elementToPath(pe);
        if (!pathA || !pathB) continue;

        let existing = dg.querySelectorAll('path, polygon, circle')[i];
        if (!existing) {
          existing = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          existing.setAttribute('class', pe.getAttribute('class') || se.getAttribute('class') || '');
          existing.setAttribute('d', pathA);
          dg.appendChild(existing);
        } else if (existing.tagName !== 'path') {
          const newEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          newEl.setAttribute('class', existing.getAttribute('class') || '');
          newEl.setAttribute('d', pathA);
          existing.parentNode.replaceChild(newEl, existing);
          existing = newEl;
        }

        try {
          const morph = flubber.interpolate(pathA, pathB, { maxSegmentLength: 3 });
          this.morphs.push({ el: existing, morph });
        } catch (e) {
          existing.setAttribute('d', pathA);
        }
      }
    }
  }

  interpolate(t) {
    for (const m of this.morphs) {
      m.el.setAttribute('d', m.morph(t));
    }
  }
}

const maskSVG = document.getElementById('mask');
const audio = new AudioEngine();
const interpolator = new InterpolationEngine(maskSVG);

let initPromise = null;

function initSVG() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const [silenceResp, speakResp] = await Promise.all([
      fetch('2_silenzio.svg'),
      fetch('1_parla.svg')
    ]);
    const silenceSVG = await silenceResp.text();
    const speakSVG = await speakResp.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(silenceSVG, 'image/svg+xml');
    const groups = doc.querySelectorAll('svg > g');
    groups.forEach(g => {
      maskSVG.appendChild(document.importNode(g, true));
    });

    interpolator.loadStates(silenceSVG, speakSVG);
  })();
  return initPromise;
}

initSVG();

const sogliaInput = document.getElementById('soglia');
const sogliaValue = document.getElementById('soglia-value');
const volumeBar = document.getElementById('volume-bar');
const micBtn = document.getElementById('mic-btn');
let started = false;

sogliaInput.addEventListener('input', () => {
  sogliaValue.textContent = parseFloat(sogliaInput.value).toFixed(2);
});

micBtn.addEventListener('click', async () => {
  if (started) {
    audio.stop();
    started = false;
    micBtn.classList.remove('active');
    return;
  }
  await initSVG();
  try {
    await audio.start();
    started = true;
    micBtn.classList.add('active');
    animate();
  } catch (err) {
    console.error('Microphone access denied:', err);
  }
});

function animate() {
  const vol = audio.getVolume();
  const soglia = parseFloat(sogliaInput.value);
  const t = Math.min(vol / soglia, 1);
  interpolator.interpolate(t);
  volumeBar.style.width = (vol * 100) + '%';
  requestAnimationFrame(animate);
}
