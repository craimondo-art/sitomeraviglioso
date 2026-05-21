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

const SILENZIO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 663.49 818.33">
  <defs>
    <style>
      .cls-1 {
        fill: #ffabe5;
      }

      .cls-2 {
        fill: #e82e89;
      }
    </style>
  </defs>
  <g id="bocca">
    <path class="cls-2" d="M283.99,665.9c-16.13-7.14-55.6-24.6-55.5-57.59.08-29.38,31.49-55.42,56.5-55.42,19.44,0,36.6,9.82,46.76,24.77,10.16-14.95,27.32-24.77,46.76-24.77,25.01,0,56.42,26.04,56.5,55.42.09,32.99-39.37,50.45-55.5,57.59-46.8,20.71-90.2,2.35-95.51,0Z"/>
  </g>
  <g id="bocca_dentro" data-name="bocca dentro">
    <path class="cls-1" d="M383.39,617.2c-.21-1.08-1.25-1.8-2.34-1.59-19.48,3.7-31.43,1.35-38.03-1.27-7.04-2.79-9.59-6.47-9.61-6.5-.36-.54-.95-.88-1.6-.9-.66-.03-1.27.27-1.66.79-11.97,15.74-47.29,7.93-47.65,7.86-1.08-.25-2.15.43-2.39,1.51s.43,2.15,1.51,2.39c.38.09,9.42,2.11,20.23,2.11h.23c.59,0,1.16-.02,1.73-.03,4.6,8.18,21.72,9.05,28.09,9.05s23.43-1.22,27.8-9.12c6.15.2,13.45-.31,22.11-1.96,1.08-.21,1.8-1.25,1.59-2.34Z"/>
  </g>
  <g id="farfallino">
    <path class="cls-1" d="M390.51,722l-58.76,40.58-58.76-40.58c-22.12-15.28-52.31.56-52.31,27.45v35.47c0,26.89,30.18,42.72,52.31,27.45l58.76-40.58,58.76,40.58c22.12,15.28,52.31-.56,52.31-27.45v-35.47c0-26.89-30.18-42.72-52.31-27.45Z"/>
  </g>
  <g id="guance">
    <path class="cls-1" d="M530.24,309.86c-12.86,35.67,28.03,16.56,63.69,29.42,35.67,12.86,52.61,52.82,65.47,17.15,12.86-35.67-5.63-75.01-41.29-87.87-35.67-12.86-75.01,5.63-87.87,41.29Z"/>
    <path class="cls-1" d="M133.25,309.86c12.86,35.67-28.03,16.56-63.69,29.42-35.67,12.86-52.61,52.82-65.47,17.15-12.86-35.67,5.63-75.01,41.29-87.87s75.01,5.63,87.87,41.29Z"/>
  </g>
  <g id="sopracciglia">
    <path class="cls-1" d="M627.37,106.49l14.2-14.2-15.67-9.31c-29.63-17.6-54.09-42.71-70.92-72.78l-5.71-10.2-14.2,14.2,4.9,8.9c16.68,30.26,41.06,55.57,70.68,73.36l16.71,10.04Z"/>
    <path class="cls-1" d="M36.12,106.49l-14.2-14.2,15.67-9.31c29.63-17.6,54.09-42.71,70.92-72.78L114.23,0l14.2,14.2-4.9,8.9c-16.68,30.26-41.06,55.57-70.68,73.36l-16.71,10.04Z"/>
  </g>
  <g id="Naso">
    <g id="NASO">
      <path class="cls-2" d="M372.8,371.01c-2.12,0-4.2.18-6.23.52l-8.4-130.09h-52.85l-8.4,130.09c-2.02-.34-4.1-.52-6.23-.52-20.54,0-37.2,16.65-37.2,37.2s16.65,37.2,37.2,37.2c1.59,0,3.16-.1,4.7-.29,3.62,16.75,18.52,29.3,36.36,29.3s32.73-12.55,36.36-29.3c1.54.19,3.11.29,4.7.29,20.54,0,37.2-16.65,37.2-37.2s-16.65-37.2-37.2-37.2Z"/>
    </g>
  </g>
  <g id="linea_naso" data-name="linea naso">
    <g>
      <path class="cls-1" d="M399.76,436.64c-.42.48-9.78,10.72-27,10.72-.98,0-1.98-.03-3.01-.1-1.84,7.39-11.08,28.22-37.93,29.15h-.14c-26.86-.93-36.1-21.76-37.93-29.15-1.03.07-2.04.1-3.01.1-17.23,0-26.59-10.24-27.01-10.72-.73-.82-.66-2.08.16-2.82.82-.74,2.09-.66,2.83.16.09.11,10.24,11.12,28.45,9.14.03,0,.07,0,.1,0,.07,0,.14,0,.21,0,.1,0,.2.01.3.03.11.02.23.06.33.1.07.02.14.05.2.09.08.04.16.08.23.14.08.05.16.11.23.18,0,.01.02.02.03.03.08.08.16.17.22.26.06.09.12.18.16.28.04.07.07.14.09.22.02.03.03.06.03.09.03.08.05.17.06.26.02.05.02.1.02.16v.03s.01.08.01.12c.12,1.71,1.99,8.22,7.06,14.42,4.55,5.58,12.98,12.34,27.23,12.88h.14c14.25-.54,22.67-7.3,27.22-12.88,5.07-6.2,6.95-12.71,7.07-14.42v-.08s0-.03.01-.04v-.03c0-.06,0-.11.02-.16,0-.09.03-.18.06-.26-.01-.02,0-.04,0-.06.03-.11.08-.21.13-.3h.01c.04-.1.09-.19.16-.27.02-.03.03-.05.05-.07.01-.02.03-.04.06-.06.04-.06.09-.11.15-.16.17-.15.36-.28.57-.36.03-.01.05-.02.08-.03.08-.03.15-.05.23-.07.02,0,.04-.01.06-.01.04-.01.08-.02.12-.02.09-.01.18-.02.27-.02h.08s.03,0,.04,0h.1c7.64.83,14.73-.45,21.1-3.8,4.78-2.51,7.34-5.31,7.36-5.34.74-.82,2-.89,2.83-.15.82.73.89,1.99.15,2.81Z"/>
      <path class="cls-1" d="M297.38,444.89v.07c0-.06,0-.11-.02-.16.01.03.02.06.02.09Z"/>
      <path class="cls-1" d="M293.5,447.32l-.07-1.77c-.18-4.64-.61-15.52,5.38-18.47,4.21-2.06,9.12-.37,12.13,2.21,2.93,2.52,4.12,5.81,3.18,8.8-1.05,3.36-5.18,7.65-18.86,9.05l-1.77.18ZM302.88,429.49c-.89,0-1.77.17-2.59.58-3.46,1.71-3.67,9.32-3.58,13.54,11.42-1.48,13.76-5.02,14.24-6.53.53-1.68-.29-3.65-2.17-5.27-1.49-1.28-3.72-2.32-5.89-2.32Z"/>
      <path class="cls-1" d="M366.14,444.8s-.02.1-.02.16v-.07s.01-.06.02-.09Z"/>
      <path class="cls-1" d="M370,447.33l-1.74-.19c-12.76-1.37-16.62-5.58-17.61-8.86-.92-3.03.36-6.45,3.32-8.92,2.79-2.33,7.3-3.8,11.07-1.86,4.96,2.58,5.29,11.02,5.03,18.08l-.07,1.75ZM361.19,429.86c-1.86,0-3.76.87-5.13,2.01-1.52,1.27-2.92,3.37-2.29,5.46.44,1.46,2.61,4.89,13.08,6.34.09-4.15-.11-11.6-3.32-13.27-.74-.38-1.54-.55-2.34-.55Z"/>
    </g>
  </g>
  <g id="occhi">
    <path class="cls-2" d="M84.23,233.63l-9.02-4.59s-4.45-90.22,64-114.78,116.89,43.34,127.72,64.24l-5.03,7.93s-32.98-43.05-102.13-26.02c0,0-64.2,10.89-75.55,73.21Z"/>
    <path class="cls-2" d="M579.27,233.63l9.02-4.59s4.45-90.22-64-114.78c-68.45-24.56-116.89,43.34-127.72,64.24l5.03,7.93s32.98-43.05,102.13-26.02c0,0,64.2,10.89,75.55,73.21Z"/>
  </g>
</svg>`;

const PARLA_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 663.49 848.48">
  <defs>
    <style>
      .cls-1 {
        fill: #ffabe5;
      }

      .cls-2 {
        fill: #e82e89;
      }
    </style>
  </defs>
  <g id="bocca_fuori" data-name="bocca fuori">
    <path class="cls-2" d="M283.99,675.9c-16.13-7.14-55.6-34.6-55.5-67.59.08-29.38,31.49-55.42,56.5-55.42,19.44,0,36.6,9.82,46.76,24.77,10.16-14.95,27.32-24.77,46.76-24.77,25.01,0,56.42,26.04,56.5,55.42.09,32.99-39.37,60.45-55.5,67.59-46.8,20.71-90.2,2.35-95.51,0Z"/>
  </g>
  <g id="bocca_dentro" data-name="bocca dentro">
    <path class="cls-1" d="M383.39,617.2c-.21-1.08-1.25-1.8-2.34-1.59-19.48,3.7-31.43,1.35-38.03-1.27-7.04-2.79-9.59-6.47-9.61-6.5-.36-.54-.95-.88-1.6-.9-.66-.03-1.27.27-1.66.79-11.97,15.74-47.29,7.93-47.65,7.86-1.08-.25-2.15.43-2.39,1.51s.43,2.15,1.51,2.39c.38.09,9.42,2.11,20.23,2.11h.23c.59,0,1.16-.02,1.73-.03,4.6,8.18,21.72,37.84,28.09,37.84s23.43-30.02,27.8-37.92c6.15.2,13.45-.31,22.11-1.96,1.08-.21,1.8-1.25,1.59-2.34Z"/>
  </g>
  <g id="farfallino">
    <polygon class="cls-1" points="442.82 685.89 331.75 762.58 220.68 685.89 220.68 848.48 331.75 771.79 442.82 848.48 442.82 685.89"/>
  </g>
  <g id="guance">
    <path class="cls-1" d="M530.24,309.86c-12.86,35.67,7.04,71.71,42.7,84.57,35.67,12.86,73.6-2.33,86.46-37.99,12.86-35.67-5.63-75.01-41.29-87.87-35.67-12.86-75.01,5.63-87.87,41.29Z"/>
    <path class="cls-1" d="M133.25,309.86c12.86,35.67-.8,74.22-36.47,87.08-35.67,12.86-79.83-4.85-92.69-40.51-12.86-35.67,5.63-75.01,41.29-87.87s75.01,5.63,87.87,41.29Z"/>
  </g>
  <g id="sopracciglia">
    <polygon class="cls-1" points="627.37 106.49 641.57 92.3 588.32 40.08 549.27 0 535.07 14.2 573.1 53.25 627.37 106.49"/>
    <polygon class="cls-1" points="36.12 106.49 21.93 92.3 67.83 46.66 114.23 0 128.42 14.2 83.05 59.83 36.12 106.49"/>
  </g>
  <g id="Naso">
    <g id="NASO">
      <path class="cls-2" d="M372.8,371.01c-2.12,0-4.2.18-6.23.52l-8.4-130.09h-52.85l-8.4,130.09c-2.02-.34-4.1-.52-6.23-.52-20.54,0-37.2,16.65-37.2,37.2s16.65,37.2,37.2,37.2c1.59,0,3.16-.1,4.7-.29,3.62,16.75,18.52,29.3,36.36,29.3s32.73-12.55,36.36-29.3c1.54.19,3.11.29,4.7.29,20.54,0,37.2-16.65,37.2-37.2s-16.65-37.2-37.2-37.2Z"/>
    </g>
  </g>
  <g id="linea_naso" data-name="linea naso">
    <g>
      <path class="cls-1" d="M399.76,436.64c-.42.48-9.78,10.72-27,10.72-.98,0-1.98-.03-3.01-.1-1.84,7.39-11.08,28.22-37.93,29.15h-.14c-26.86-.93-36.1-21.76-37.93-29.15-1.03.07-2.04.1-3.01.1-17.23,0-26.59-10.24-27.01-10.72-.73-.82-.66-2.08.16-2.82.82-.74,2.09-.66,2.83.16.09.11,10.24,11.12,28.45,9.14.03,0,.07,0,.1,0,.07,0,.14,0,.21,0,.1,0,.2.01.3.03.11.02.23.06.33.1.07.02.14.05.2.09.08.04.16.08.23.14.08.05.16.11.23.18,0,.01.02.02.03.03.08.08.16.17.22.26.06.09.12.18.16.28.04.07.07.14.09.22.02.03.03.06.03.09.03.08.05.17.06.26.02.05.02.1.02.16v.03s.01.08.01.12c.12,1.71,1.99,8.22,7.06,14.42,4.55,5.58,12.98,12.34,27.23,12.88h.14c14.25-.54,22.67-7.3,27.22-12.88,5.07-6.2,6.95-12.71,7.07-14.42v-.08s0-.03.01-.04v-.03c0-.06,0-.11.02-.16,0-.09.03-.18.06-.26-.01-.02,0-.04,0-.06.03-.11.08-.21.13-.3h.01c.04-.1.09-.19.16-.27.02-.03.03-.05.05-.07.01-.02.03-.04.06-.06.04-.06.09-.11.15-.16.17-.15.36-.28.57-.36.03-.01.05-.02.08-.03.08-.03.15-.05.23-.07.02,0,.04-.01.06-.01.04-.01.08-.02.12-.02.09-.01.18-.02.27-.02h.08s.03,0,.04,0h.1c7.64.83,14.73-.45,21.1-3.8,4.78-2.51,7.34-5.31,7.36-5.34.74-.82,2-.89,2.83-.15.82.73.89,1.99.15,2.81Z"/>
      <path class="cls-1" d="M297.38,444.89v.07c0-.06,0-.11-.02-.16.01.03.02.06.02.09Z"/>
      <path class="cls-1" d="M293.53,447.32l-.08-2.13c-.22-5.57-.73-18.6,6.45-22.14,5.04-2.47,10.94-.45,14.54,2.65,3.51,3.02,4.94,6.96,3.81,10.55-1.26,4.02-6.21,9.17-22.61,10.85l-2.12.22ZM304.77,425.95c-1.07,0-2.12.21-3.11.69-4.15,2.04-4.4,11.17-4.29,16.24,13.69-1.77,16.5-6.02,17.06-7.82.63-2.01-.34-4.38-2.6-6.32-1.79-1.54-4.46-2.78-7.06-2.78Z"/>
      <path class="cls-1" d="M366.14,444.8s-.02.1-.02.16v-.07s.01-.06.02-.09Z"/>
      <path class="cls-1" d="M369.97,447.33l-2.13-.23c-15.62-1.68-20.34-6.83-21.56-10.84-1.12-3.71.44-7.89,4.07-10.92,3.42-2.85,8.93-4.65,13.54-2.27,6.07,3.16,6.48,13.48,6.16,22.12l-.08,2.14ZM359.19,425.95c-2.27,0-4.6,1.07-6.28,2.46-1.86,1.55-3.58,4.12-2.8,6.69.54,1.79,3.19,5.99,16.01,7.76.11-5.08-.13-14.2-4.06-16.24-.9-.47-1.88-.67-2.87-.67Z"/>
    </g>
  </g>
  <g id="occhi">
    <path class="cls-2" d="M84.23,233.63l-9.02-4.59s-4.45-90.22,64-114.78,116.89,43.34,127.72,64.24l-5.03,7.93h0c-52.54,29.59-111.57,45.76-171.86,47.07l-5.81.13Z"/>
    <path class="cls-2" d="M579.27,233.63l9.02-4.59s4.45-90.22-64-114.78-116.89,43.34-127.72,64.24l5.03,7.93h0c52.54,29.59,111.57,45.76,171.86,47.07l5.81.13Z"/>
  </g>
</svg>`;

const maskSVG = document.getElementById('mask');
const audio = new AudioEngine();
const interpolator = new InterpolationEngine(maskSVG);

function initSVG() {
  const parser = new DOMParser();
  const doc = parser.parseFromString(SILENZIO_SVG, 'image/svg+xml');
  const groups = doc.querySelectorAll('svg > g');
  groups.forEach(g => {
    maskSVG.appendChild(document.importNode(g, true));
  });

  interpolator.loadStates(SILENZIO_SVG, PARLA_SVG);
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
