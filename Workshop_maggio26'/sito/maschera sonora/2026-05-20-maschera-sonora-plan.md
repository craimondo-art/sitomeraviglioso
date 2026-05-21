# Maschera Sonora Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Build a web-based sound-responsive SVG animation that interpolates between "silenzio" and "parla" states using real-time microphone volume.

**Architecture:** Vanilla JS with Web Audio API. Three logical modules: Audio Engine (mic capture → RMS → smoothing), Interpolation Engine (path coordinate interpolation between two SVG states), and Renderer (requestAnimationFrame loop updating SVG attributes). UI includes a "soglia" threshold slider.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Web Audio API (getUserMedia, AnalyserNode), SVG

---

### Task 1: HTML Scaffold with Inline SVGs

**Files:**
- Create: `maschera sonora/index.html`
- Create: `maschera sonora/style.css`

- [ ] **Step 1: Create index.html with DOCTYPE, meta viewport, and structure**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Maschera Sonora</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="container">
    <svg id="mask" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 663.49 848.48">
      <!-- SVG content will be populated by JS from embedded data -->
    </svg>
    <div id="controls">
      <label for="soglia">Soglia: <span id="soglia-value">0.30</span></label>
      <input type="range" id="soglia" min="0.05" max="1.0" step="0.01" value="0.30">
      <div id="volume-bar-container">
        <div id="volume-bar"></div>
      </div>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create style.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
}

#container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

#mask {
  width: 100%;
  height: auto;
  display: block;
}

#controls {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 300px;
}

#controls label {
  color: #ffabe5;
  font-size: 14px;
  letter-spacing: 1px;
}

#soglia {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #333;
  border-radius: 2px;
  outline: none;
}

#soglia::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e82e89;
  cursor: pointer;
}

#soglia::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e82e89;
  cursor: pointer;
  border: none;
}

#volume-bar-container {
  width: 100%;
  height: 6px;
  background: #222;
  border-radius: 3px;
  overflow: hidden;
}

#volume-bar {
  height: 100%;
  width: 0%;
  background: #ffabe5;
  border-radius: 3px;
  transition: width 0.05s linear;
}
```

- [ ] **Step 3: Commit**

```bash
git add "maschera sonora/index.html" "maschera sonora/style.css"
git commit -m "feat: add HTML scaffold and CSS for maschera sonora"
```

---

### Task 2: Audio Engine Module

**Files:**
- Create: `maschera sonora/script.js` (first block: AudioEngine)

- [ ] **Step 1: Write AudioEngine class to script.js**

```js
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.smoothVolume = 0;
    this.alpha = 0.3; // EMA smoothing factor
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
```

- [ ] **Step 2: Commit**

```bash
git add "maschera sonora/script.js"
git commit -m "feat: add AudioEngine with mic capture and RMS smoothing"
```

---

### Task 3: SVG Interpolation Engine

**Files:**
- Modify: `maschera sonora/script.js` (append InterpolationEngine)

- [ ] **Step 1: Append InterpolationEngine class**

```js
class InterpolationEngine {
  constructor(svgElement) {
    this.svg = svgElement;
    this.states = { silence: null, speak: null };
  }

  loadStates(silenceSVGString, speakSVGString) {
    this.states.silence = this.parsePaths(silenceSVGString);
    this.states.speak = this.parsePaths(speakSVGString);
  }

  parsePaths(svgString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = {};
    const groups = doc.querySelectorAll('svg > g');
    groups.forEach(g => {
      const id = g.getAttribute('id');
      const elements = [];
      g.querySelectorAll('path, polygon, circle').forEach(el => {
        const tag = el.tagName;
        const d = el.getAttribute('d') || '';
        const points = el.getAttribute('points') || '';
        const cx = el.getAttribute('cx') || '';
        const cy = el.getAttribute('cy') || '';
        const r = el.getAttribute('r') || '';
        elements.push({ tag, d, points, cx, cy, r });
      });
      paths[id] = elements;
    });
    return paths;
  }

  polygonToPath(pointsStr) {
    if (!pointsStr) return '';
    const coords = pointsStr.trim().split(/[\s,]+/).map(Number);
    if (coords.length < 2) return '';
    let d = `M ${coords[0]} ${coords[1]}`;
    for (let i = 2; i < coords.length; i += 2) {
      d += ` L ${coords[i]} ${coords[i + 1]}`;
    }
    d += ' Z';
    return d;
  }

  parsePathCommands(d) {
    const regex = /([MLQCZ])\s*([^MLQCZ]*)/gi;
    const commands = [];
    let match;
    while ((match = regex.exec(d)) !== null) {
      const cmd = match[1];
      const nums = match[2].trim().split(/[\s,]+/).filter(s => s !== '').map(Number);
      commands.push({ cmd, nums });
    }
    return commands;
  }

  commandsToD(commands) {
    return commands.map(c => c.cmd + ' ' + c.nums.join(' ')).join(' ');
  }

  interpolateCommands(cmdsA, cmdsB, t) {
    const len = Math.min(cmdsA.length, cmdsB.length);
    const result = [];
    for (let i = 0; i < len; i++) {
      const a = cmdsA[i];
      const b = cmdsB[i];
      const maxLen = Math.max(a.nums.length, b.nums.length);
      const nums = [];
      for (let j = 0; j < maxLen; j++) {
        const va = j < a.nums.length ? a.nums[j] : a.nums[a.nums.length - 1];
        const vb = j < b.nums.length ? b.nums[j] : b.nums[b.nums.length - 1];
        nums.push(va + (vb - va) * t);
      }
      result.push({ cmd: b.cmd || a.cmd, nums });
    }
    return result;
  }

  interpolate(t) {
    const s = this.states.silence;
    const p = this.states.speak;
    for (const groupId in s) {
      const silenceEls = s[groupId] || [];
      const speakEls = p[groupId] || [];
      const g = this.svg.querySelector(`#${groupId}`);
      if (!g) continue;

      const maxLen = Math.max(silenceEls.length, speakEls.length);
      for (let i = 0; i < maxLen; i++) {
        const se = silenceEls[i];
        const pe = speakEls[i];
        if (!se || !pe) continue;

        let existing = g.querySelectorAll('path, polygon, circle')[i];
        if (!existing) continue;

        if (se.tag === 'circle' && pe.tag === 'circle') {
          const cx = parseFloat(se.cx) + (parseFloat(pe.cx) - parseFloat(se.cx)) * t;
          const cy = parseFloat(se.cy) + (parseFloat(pe.cy) - parseFloat(se.cy)) * t;
          const r = parseFloat(se.r) + (parseFloat(pe.r) - parseFloat(se.r)) * t;
          existing.setAttribute('cx', cx);
          existing.setAttribute('cy', cy);
          existing.setAttribute('r', r);
        } else {
          const dA = se.tag === 'polygon' ? this.polygonToPath(se.points) : se.d;
          const dB = pe.tag === 'polygon' ? this.polygonToPath(pe.points) : pe.d;
          const cmdsA = this.parsePathCommands(dA);
          const cmdsB = this.parsePathCommands(dB);
          if (cmdsA.length > 0 && cmdsB.length > 0) {
            const interpolated = this.interpolateCommands(cmdsA, cmdsB, t);
            existing.setAttribute('d', this.commandsToD(interpolated));
            if (existing.tagName === 'polygon') {
              const newEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              newEl.setAttribute('class', existing.getAttribute('class'));
              newEl.setAttribute('d', this.commandsToD(interpolated));
              existing.parentNode.replaceChild(newEl, existing);
            }
          }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add "maschera sonora/script.js"
git commit -m "feat: add InterpolationEngine with path coordinate interpolation"
```

---

### Task 4: Animation Loop + UI Bindings

**Files:**
- Modify: `maschera sonora/script.js` (append initialization and main loop)

- [ ] **Step 1: Add initialization and animation loop**

```js
// --- SILENCE SVG DATA (as template literal) ---
const silenceSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 663.49 818.33">
  <defs>
    <style>
      .cls-1 { fill: #ffabe5; }
      .cls-2 { stroke-linecap: round; stroke-linejoin: round; }
      .cls-2, .cls-3 { fill: none; stroke: #ffabe5; stroke-width: 4px; }
      .cls-3 { stroke-miterlimit: 10; }
      .cls-4 { fill: #e82e89; }
    </style>
  </defs>
  <g id="bocca">
    <path class="cls-4" d="M283.99,665.9c-16.13-7.14-55.6-24.6-55.5-57.59.08-29.38,31.49-55.42,56.5-55.42,19.44,0,36.6,9.82,46.76,24.77,10.16-14.95,27.32-24.77,46.76-24.77,25.01,0,56.42,26.04,56.5,55.42.09,32.99-39.37,50.45-55.5,57.59-46.8,20.71-90.2,2.35-95.51,0Z"/>
    <path class="cls-2" d="M282.06,617.53s36.78,8.37,49.68-8.6c0,0,10.51,16.06,49.68,8.63"/>
    <path class="cls-1" d="M360.73,619.6s-21.66,9.6-29.04,9.6-29.04-9.7-29.04-9.7c21.91.91,21.86-8.75,29.24-8.98,5.16-.16,7.07,6.85,28.84,9.08Z"/>
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
      <path class="cls-4" d="M372.8,371.01c-2.12,0-4.2.18-6.23.52l-8.4-130.09h-52.85l-8.4,130.09c-2.02-.34-4.1-.52-6.23-.52-20.54,0-37.2,16.65-37.2,37.2s16.65,37.2,37.2,37.2c1.59,0,3.16-.1,4.7-.29,3.62,16.75,18.52,29.3,36.36,29.3s32.73-12.55,36.36-29.3c1.54.19,3.11.29,4.7.29,20.54,0,37.2-16.65,37.2-37.2s-16.65-37.2-37.2-37.2Z"/>
      <g>
        <path class="cls-3" d="M331.75,474.41c-28.59-.99-36.22-25.54-36.36-29.3"/>
        <path class="cls-3" d="M295.39,445.11c-19.54,2.11-30.17-9.8-30.17-9.8"/>
        <path class="cls-3" d="M295.39,445.11c-.09-2.4-.19-7.03,2.05-8.19,4.33-2.23,12.16,6.66-2.05,8.19Z"/>
        <path class="cls-3" d="M398.27,435.32s-10.62,11.91-30.17,9.8"/>
        <path class="cls-3" d="M368.11,445.11c-14.21-1.53-6.38-10.42-2.05-8.19,2.23,1.16,2.14,5.79,2.05,8.19Z"/>
        <path class="cls-3" d="M368.1,445.11c-.14,3.76-7.77,28.31-36.36,29.3"/>
      </g>
    </g>
  </g>
  <g id="occhi">
    <path class="cls-4" d="M84.23,233.63l-9.02-4.59s-4.45-90.22,64-114.78,116.89,43.34,127.72,64.24l-5.03,7.93s-32.98-43.05-102.13-26.02c0,0-64.2,10.89-75.55,73.21Z"/>
    <path class="cls-4" d="M579.27,233.63l9.02-4.59s4.45-90.22-64-114.78c-68.45-24.56-116.89,43.34-127.72,64.24l5.03,7.93s32.98-43.05,102.13-26.02c0,0,64.2,10.89,75.55,73.21Z"/>
  </g>
</svg>`;

// --- SPEAK SVG DATA (as template literal) ---
const speakSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 663.49 848.48">
  <defs>
    <style>
      .cls-1 { fill: #ffabe5; }
      .cls-2 { stroke-linecap: round; stroke-linejoin: round; }
      .cls-2, .cls-3 { fill: none; stroke: #ffabe5; stroke-width: 4px; }
      .cls-3 { stroke-miterlimit: 10; }
      .cls-4 { fill: #e82e89; }
    </style>
  </defs>
  <g id="bocca">
    <path class="cls-4" d="M283.99,675.9c-16.13-7.14-55.6-34.6-55.5-67.59.08-29.38,31.49-55.42,56.5-55.42,19.44,0,36.6,9.82,46.76,24.77,10.16-14.95,27.32-24.77,46.76-24.77,25.01,0,56.42,26.04,56.5,55.42.09,32.99-39.37,60.45-55.5,67.59-46.8,20.71-90.2,2.35-95.51,0Z"/>
    <path class="cls-2" d="M282.06,617.53s36.78,8.37,49.68-8.6c0,0,10.51,16.06,49.68,8.63"/>
    <circle class="cls-1" cx="331.89" cy="612.31" r="1.96"/>
    <path class="cls-1" d="M360.73,619.6s-21.46,39.81-28.84,39.81-29.24-39.91-29.24-39.91c21.91.91,21.86-8.75,29.24-8.98,5.16-.16,7.07,6.85,28.84,9.08Z"/>
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
      <path class="cls-4" d="M372.8,371.01c-2.12,0-4.2.18-6.23.52l-8.4-130.09h-52.85l-8.4,130.09c-2.02-.34-4.1-.52-6.23-.52-20.54,0-37.2,16.65-37.2,37.2s16.65,37.2,37.2,37.2c1.59,0,3.16-.1,4.7-.29,3.62,16.75,18.52,29.3,36.36,29.3s32.73-12.55,36.36-29.3c1.54.19,3.11.29,4.7.29,20.54,0,37.2-16.65,37.2-37.2s-16.65-37.2-37.2-37.2Z"/>
      <g>
        <path class="cls-3" d="M331.75,474.41c-28.59-.99-36.22-25.54-36.36-29.3"/>
        <path class="cls-3" d="M295.39,445.11c-19.54,2.11-30.17-9.8-30.17-9.8"/>
        <path class="cls-3" d="M295.45,445.11c-.23-5.94-.49-17.4,5.34-20.27,11.28-5.52,31.66,16.48-5.34,20.27Z"/>
        <path class="cls-3" d="M398.27,435.32s-10.62,11.91-30.17,9.8"/>
        <path class="cls-3" d="M368.06,445.11c-35.17-3.79-15.79-25.79-5.07-20.27,5.52,2.87,5.3,14.33,5.07,20.27Z"/>
        <path class="cls-3" d="M368.1,445.11c-.14,3.76-7.77,28.31-36.36,29.3"/>
      </g>
    </g>
  </g>
  <g id="occhi">
    <path class="cls-4" d="M84.23,233.63l-9.02-4.59s-4.45-90.22,64-114.78,116.89,43.34,127.72,64.24l-5.03,7.93h0c-52.54,29.59-111.57,45.76-171.86,47.07l-5.81.13Z"/>
    <path class="cls-4" d="M579.27,233.63l9.02-4.59s4.45-90.22-64-114.78-116.89,43.34-127.72,64.24l5.03,7.93h0c52.54,29.59,111.57,45.76,171.86,47.07l5.81.13Z"/>
  </g>
</svg>`;

// --- INIT ---
const maskSVG = document.getElementById('mask');
const audio = new AudioEngine();
const interpolator = new InterpolationEngine(maskSVG);

interpolator.loadStates(silenceSVG, speakSVG);

const sogliaInput = document.getElementById('soglia');
const sogliaValue = document.getElementById('soglia-value');
const volumeBar = document.getElementById('volume-bar');

let started = false;

sogliaInput.addEventListener('input', () => {
  sogliaValue.textContent = parseFloat(sogliaInput.value).toFixed(2);
});

// Click to start audio
document.addEventListener('click', async () => {
  if (started) return;
  try {
    await audio.start();
    started = true;
    animate();
  } catch (err) {
    console.error('Microphone access denied:', err);
  }
}, { once: true });

function animate() {
  const vol = audio.getVolume();
  const soglia = parseFloat(sogliaInput.value);
  const t = Math.min(vol / soglia, 1);
  interpolator.interpolate(t);
  volumeBar.style.width = (vol * 100) + '%';
  requestAnimationFrame(animate);
}
```

- [ ] **Step 2: Commit**

```bash
git add "maschera sonora/script.js"
git commit -m "feat: add animation loop, UI bindings, and SVG data"
```

---

### Task 5: Final Review

**Files:**
- Review: all files

- [ ] **Step 1: Open index.html in browser and verify**

Run a local server from the project root:
```bash
python3 -m http.server 8000 --directory "/Users/clarissaraimondo/Desktop/Workshop_maggio26/Workshop_maggio26'"
```

Then open `http://localhost:8000/maschera%20sonora/index.html` in a browser.

Verify:
1. Click anywhere to enable microphone
2. Say something — mask should interpolate toward "parla" state
3. Adjust "soglia" slider — low value = more sensitive, high value = less sensitive
4. Volume bar moves in real-time
5. Silence returns mask to "silenzio" state (t=0)
