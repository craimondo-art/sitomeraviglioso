# Texture Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-file HTML tool that displays the SVG texture repeated in tiling, with real-time controls for fill color, stroke color, and scale.

**Architecture:** Single HTML page with inline CSS and JS. SVG embedded as template string. Canvas 2D renders the texture via offscreen canvas for tiling. Three floating white buttons at the bottom control the state.

**Tech Stack:** Vanilla JS, HTML5 Canvas, CSS3

**Files:**
- Create: `Workshop_maggio26'/texture/index.html`

---

### Task 1: HTML scaffold + CSS layout

**Files:**
- Create: `Workshop_maggio26'/texture/index.html`

- [ ] **Step 1: Write the HTML skeleton and CSS**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Texture Viewer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #fff;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .controls {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #fff;
      border: none;
      border-radius: 60px;
      padding: 12px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #1d1d1b;
      min-width: 120px;
      justify-content: center;
    }

    .btn .color-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1.5px solid #ccc;
      flex-shrink: 0;
    }

    .btn-scale {
      min-width: 200px;
      cursor: default;
    }

    .btn-scale input[type="range"] {
      flex: 1;
      min-width: 80px;
    }

    .btn-scale .scale-value {
      min-width: 28px;
      text-align: center;
      font-size: 13px;
    }

    input[type="color"] {
      display: none;
    }
  </style>
</head>
<body>
  <canvas id="textureCanvas"></canvas>

  <div class="controls" id="controls">
    <!-- Fill -->
    <button class="btn" id="btnFill">
      Fill
      <span class="color-circle" id="fillCircle" style="background: #ffffff;"></span>
    </button>
    <input type="color" id="fillPicker" value="#ffffff">

    <!-- Stroke -->
    <button class="btn" id="btnStroke">
      Stroke
      <span class="color-circle" id="strokeCircle" style="background: #1d1d1b;"></span>
    </button>
    <input type="color" id="strokePicker" value="#1d1d1b">

    <!-- Scale -->
    <div class="btn btn-scale" id="btnScale">
      <span class="scale-value" id="scaleLabel">1.0</span>
      <input type="range" id="scaleSlider" min="0.25" max="3" step="0.1" value="1">
    </div>
  </div>

  <script>
    // JS will be added in subsequent tasks
  </script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify layout**

Open `Workshop_maggio26'/texture/index.html` in browser. Verify:
- Canvas fills the full viewport
- 3 buttons visible at bottom center, floating, white with shadow
- Fill button has a white circle, Stroke button has a dark circle
- Scale button has slider and "1.0" label

- [ ] **Step 3: Commit**

```bash
git add Workshop_maggio26'/texture/index.html
git commit -m "feat: add html scaffold and css layout for texture viewer"
```

---

### Task 2: SVG data + main rendering function

**Files:**
- Modify: `Workshop_maggio26'/texture/index.html`

- [ ] **Step 1: Embedded SVG string + state + render function**

Replace the empty `<script>` block with:

```javascript
const SVG_TEMPLATE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20.82 46.92">
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x=".5" y="33.8" width="9.61" height="3.49"/>
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x="5.3" y="23.31" width="8.77" height="10.49"/>
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x="9.22" y="33.8" width="9.78" height="12.63"/>
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x="1.62" y="24.7" width="3.65" height="4.71"/>
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x="2.91" y="12.32" width="2.39" height="12.38"/>
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x="5.3" y=".5" width="8.77" height="22.81"/>
  <rect fill="FILL" stroke="STROKE" stroke-miterlimit="10" x="14.11" y="20.32" width="6.21" height="13.48"/>
</svg>`;

const state = {
  fill: '#ffffff',
  stroke: '#1d1d1b',
  scale: 1
};

const canvas = document.getElementById('textureCanvas');
const ctx = canvas.getContext('2d');
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
}

function render() {
  const svgContent = SVG_TEMPLATE
    .replaceAll('FILL', state.fill)
    .replaceAll('STROKE', state.stroke);

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const baseW = 20.82;
    const baseH = 46.92;
    const scaledW = baseW * state.scale;
    const scaledH = baseH * state.scale;

    offscreen.width = Math.ceil(scaledW);
    offscreen.height = Math.ceil(scaledH);
    offCtx.drawImage(img, 0, 0, scaledW, scaledH);

    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (let y = 0; y < h; y += scaledH) {
      for (let x = 0; x < w; x += scaledW) {
        ctx.drawImage(offscreen, x, y, scaledW, scaledH);
      }
    }

    URL.revokeObjectURL(url);
  };
  img.src = url;
}

window.addEventListener('resize', () => {
  resizeCanvas();
  render();
});

resizeCanvas();
render();
```

- [ ] **Step 2: Open in browser and verify rendering**

Open the page. Verify:
- Texture tiles across the entire canvas
- No gaps between tiles (or minimal visual gaps)
- White fill with dark stroke (matching original SVG colors)

- [ ] **Step 3: Commit**

```bash
git add Workshop_maggio26'/texture/index.html
git commit -m "feat: implement rendering engine with offscreen canvas tiling"
```

---

### Task 3: Fill color control

**Files:**
- Modify: `Workshop_maggio26'/texture/index.html`

- [ ] **Step 1: Wire the Fill button + color picker**

Find the `<script>` block. After the `render()` function declaration, add:

```javascript
// --- Fill control ---
const fillPicker = document.getElementById('fillPicker');
const fillCircle = document.getElementById('fillCircle');
const btnFill = document.getElementById('btnFill');

btnFill.addEventListener('click', () => fillPicker.click());

fillPicker.addEventListener('input', (e) => {
  state.fill = e.target.value;
  fillCircle.style.background = state.fill;
  render();
});
```

- [ ] **Step 2: Open in browser and verify**

- Click Fill button → color picker opens
- Pick a new color → circle updates, texture updates in real-time

- [ ] **Step 3: Commit**

```bash
git add Workshop_maggio26'/texture/index.html
git commit -m "feat: add fill color picker control"
```

---

### Task 4: Stroke color control

**Files:**
- Modify: `Workshop_maggio26'/texture/index.html`

- [ ] **Step 1: Wire the Stroke button + color picker**

After the Fill control code, add:

```javascript
// --- Stroke control ---
const strokePicker = document.getElementById('strokePicker');
const strokeCircle = document.getElementById('strokeCircle');
const btnStroke = document.getElementById('btnStroke');

btnStroke.addEventListener('click', () => strokePicker.click());

strokePicker.addEventListener('input', (e) => {
  state.stroke = e.target.value;
  strokeCircle.style.background = state.stroke;
  render();
});
```

- [ ] **Step 2: Open in browser and verify**

- Click Stroke button → color picker opens
- Pick a new color → circle updates, texture border updates in real-time

- [ ] **Step 3: Commit**

```bash
git add Workshop_maggio26'/texture/index.html
git commit -m "feat: add stroke color picker control"
```

---

### Task 5: Scale slider control

**Files:**
- Modify: `Workshop_maggio26'/texture/index.html`

- [ ] **Step 1: Wire the Scale slider**

After the Stroke control code, add:

```javascript
// --- Scale control ---
const scaleSlider = document.getElementById('scaleSlider');
const scaleLabel = document.getElementById('scaleLabel');

scaleSlider.addEventListener('input', (e) => {
  state.scale = parseFloat(e.target.value);
  scaleLabel.textContent = state.scale.toFixed(1);
  render();
});
```

- [ ] **Step 2: Open in browser and verify**

- Move slider → label updates, texture scales in real-time
- At 1.0: original size
- At 0.25: small tiles
- At 3.0: large tiles

- [ ] **Step 3: Commit**

```bash
git add Workshop_maggio26'/texture/index.html
git commit -m "feat: add scale slider control"
```

---

### Task 6: Final polish & self-review

**Files:**
- Modify: `Workshop_maggio26'/texture/index.html`

- [ ] **Step 1: Verify all interactions work together**

Open in browser and test the full flow:
1. Page loads → texture tiles full screen in default colors
2. Change Fill → texture updates, circle updates
3. Change Stroke → texture updates, circle updates
4. Change Scale → texture tiles resize in real-time
5. Resize window → canvas and tiling recalculate correctly
6. Buttons are properly centered at bottom, equidistant, with correct styling (border-radius: 60px, white bg, black shadow at 20%)

- [ ] **Step 2: Commit**

```bash
git add Workshop_maggio26'/texture/index.html
git commit -m "feat: complete texture viewer with fill, stroke, and scale controls"
```
