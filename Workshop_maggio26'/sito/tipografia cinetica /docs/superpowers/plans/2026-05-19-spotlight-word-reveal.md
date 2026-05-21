# Spotlight Word Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing "tipografia cinetica" stage-lighting HTML with a streamlined spotlight word-reveal tool.

**Architecture:** Single HTML file with Canvas 2D rendering. Word is rendered invisibly on black background and revealed via compositing with circular radial gradients that represent moving spotlights.

**Tech Stack:** Vanilla JS, Canvas 2D, no dependencies.

---

### Task 1: HTML structure, CSS, and canvas setup

**Files:**
- Modify: `index.html` (full rewrite)

- [ ] **Step 1: Write the base HTML, CSS, and JS scaffold**

```html
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Spotlight Word Reveal</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #000; color: #ccc; font-family: 'Segoe UI', system-ui, sans-serif; }

.app { display: flex; width: 100%; height: 100vh; }
.scene-panel { flex: 1; height: 100%; }
.mixer-panel {
  width: 280px; min-width: 280px; height: 100%;
  background: #111; border-left: 1px solid #222;
  overflow-y: auto; padding: 12px;
}
.panel-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; color: #666; }
.section-title { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; margin: 12px 0 6px; color: #444; }

.field { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 11px; color: #888; }
.field .label { width: 60px; flex-shrink: 0; }
.field input[type="range"] { flex: 1; height: 3px; accent-color: #ffd700; }
.field input[type="color"] { width: 26px; height: 20px; padding: 0; border: 1px solid #333; background: none; cursor: pointer; }
.text-input { flex: 1; background: #1a1a1a; color: #e0e0e0; border: 1px solid #333; padding: 4px 8px; font-size: 14px; font-family: inherit; }
.val { width: 32px; text-align: right; font-size: 10px; color: #555; }

.channel { background: #181818; border: 1px solid #222; border-radius: 4px; padding: 6px; margin-bottom: 4px; }
.channel.active { border-color: #ffd700; }
.channel-hdr { display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.tog { padding: 1px 6px; border-radius: 3px; border: 1px solid; font-size: 9px; font-weight: 600; cursor: pointer; background: none; }
.tog.on { color: #ffd700; border-color: #ffd700; }
.tog.off { color: #555; border-color: #333; }
.ch-num { flex: 1; font-size: 11px; font-weight: 500; color: #999; }
.rm { background: none; border: none; color: #555; cursor: pointer; font-size: 12px; padding: 0 4px; }
.rm:hover { color: #f44; }

.add-btn {
  display: block; width: 100%; margin-top: 8px;
  background: #1a1a1a; color: #888; border: 1px dashed #333;
  padding: 6px; font-size: 11px; cursor: pointer; text-align: center; border-radius: 3px;
}
.add-btn:hover { border-color: #ffd700; color: #ffd700; }

canvas { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>
<div class="app">
  <div class="scene-panel">
    <canvas id="c"></canvas>
  </div>
  <div class="mixer-panel" id="panel"></div>
</div>
<script>
// ─── State ───────────────────────────────────────────────────────
const S = {
  word: 'LUCE',
  spotlights: [],
  nextId: 1,
};

// ─── Canvas setup ─────────────────────────────────────────────────
const c = document.getElementById('c');
const ctx = c.getContext('2d');
const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d');
const colorCanvas = document.createElement('canvas');
const colorCtx = colorCanvas.getContext('2d');

let W, H, dpr;

function resize() {
  const rect = c.parentElement.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  W = rect.width;
  H = rect.height;
  c.width = W * dpr;
  c.height = H * dpr;
  c.style.width = W + 'px';
  c.style.height = H + 'px';
  maskCanvas.width = W * dpr;
  maskCanvas.height = H * dpr;
  colorCanvas.width = W * dpr;
  colorCanvas.height = H * dpr;
}
window.addEventListener('resize', resize);
resize();

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}

// ─── Render loop (placeholder) ────────────────────────────────────
function render() {
  requestAnimationFrame(render);
}

render();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify it opens without errors**

Run: Open `index.html` in a browser — canvas renders, panel shows, no console errors.

- [ ] **Step 3: Commit**

```bash
git add "Workshop_maggio26'/tipografia cinetica/index.html"
git commit -m "feat: scaffold spotlight word reveal HTML structure"
```

---

### Task 2: Spotlight data model and creation

**Files:**
- Modify: `index.html` (add state manipulation functions after the state object)

- [ ] **Step 1: Add spotlight creation helpers**

Add right after `const S = { ... }`:

```js
function createSpotlight() {
  const id = S.nextId++;
  return {
    id,
    active: true,
    color: '#ffffff',
    softness: 0.5,
    speed: 0.5,
    wander: 0.5,
    x: Math.random(),
    y: Math.random(),
    vx: 0,
    vy: 0,
    targetX: Math.random(),
    targetY: Math.random(),
    radius: 120,
  };
}

function addSpotlight() {
  const sl = createSpotlight();
  S.spotlights.push(sl);
  renderPanel();
}

function removeSpotlight(id) {
  S.spotlights = S.spotlights.filter(s => s.id !== id);
  renderPanel();
}

function toggleSpotlight(id) {
  const sl = S.spotlights.find(s => s.id === id);
  if (sl) sl.active = !sl.active;
  renderPanel();
}

function updateSpotlight(id, patch) {
  const sl = S.spotlights.find(s => s.id === id);
  if (sl) Object.assign(sl, patch);
}
```

- [ ] **Step 2: Verify**

Open in browser and call `addSpotlight()` from console — `S.spotlights` should have one entry with the correct shape.

- [ ] **Step 3: Commit**

```bash
git add "Workshop_maggio26'/tipografia cinetica/index.html"
git commit -m "feat: add spotlight data model and CRUD helpers"
```

---

### Task 3: Movement system

**Files:**
- Modify: `index.html` (add update function called each frame)

- [ ] **Step 1: Add movement update function**

Add before `function render()`:

```js
const TARGET_CHANGE_INTERVAL = 120; // frames (~2s at 60fps)
let frameCount = 0;

function updateMovement() {
  frameCount++;
  for (const sl of S.spotlights) {
    if (!sl.active) continue;

    // Pick new target periodically
    if (frameCount % TARGET_CHANGE_INTERVAL === 0) {
      const wanderRadius = sl.wander * 0.4;
      sl.targetX = clamp(sl.x + (Math.random() - 0.5) * wanderRadius * 2, 0.05, 0.95);
      sl.targetY = clamp(sl.y + (Math.random() - 0.5) * wanderRadius * 2, 0.05, 0.95);
    }

    // Accelerate toward target
    const accel = sl.speed * 0.02;
    sl.vx += (sl.targetX - sl.x) * accel;
    sl.vy += (sl.targetY - sl.y) * accel;

    // Damping
    sl.vx *= 0.95;
    sl.vy *= 0.95;

    // Move
    sl.x += sl.vx;
    sl.y += sl.vy;

    // Clamp to canvas bounds and bounce
    sl.x = clamp(sl.x, 0, 1);
    sl.y = clamp(sl.y, 0, 1);
  }
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
```

- [ ] **Step 2: Wire into render loop**

Replace the placeholder `render()`:

```js
function render() {
  updateMovement();
  // rendering will be added next task
  requestAnimationFrame(render);
}
```

- [ ] **Step 3: Verify**

Call `addSpotlight()` from console, observe `S.spotlights[0].x` and `S.spotlights[0].y` changing over time. Values stay within [0,1].

- [ ] **Step 4: Commit**

```bash
git add "Workshop_maggio26'/tipografia cinetica/index.html"
git commit -m "feat: add smooth random walk movement system"
```

---

### Task 4: Rendering pipeline (word + spotlight compositing)

**Files:**
- Modify: `index.html` (replace render function body)

- [ ] **Step 1: Implement the compositing render pipeline**

Replace the content inside `function render()`:

```js
function render() {
  updateMovement();

  const word = S.word || ' ';

  // 1. Clear main canvas to black
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // 2. Clear offscreen canvases
  maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  colorCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  maskCtx.clearRect(0, 0, W, H);
  colorCtx.clearRect(0, 0, W, H);

  // 3. Draw each spotlight gradient on both masks and color canvases
  const active = S.spotlights.filter(s => s.active);
  for (const sl of active) {
    const px = sl.x * W;
    const py = sl.y * H;
    const r = sl.radius;
    const col = hexToRgb(sl.color);

    // Inner stop controls softness: 1-softness = where gradient starts fading
    const innerStop = Math.max(0, 1 - sl.softness * 0.8);

    // Luminosity mask (white)
    const mg = maskCtx.createRadialGradient(px, py, 0, px, py, r);
    mg.addColorStop(0, 'rgba(255,255,255,1)');
    mg.addColorStop(innerStop, 'rgba(255,255,255,1)');
    mg.addColorStop(1, 'rgba(255,255,255,0)');
    maskCtx.fillStyle = mg;
    maskCtx.beginPath();
    maskCtx.arc(px, py, r, 0, Math.PI * 2);
    maskCtx.fill();

    // Color layer
    const cg = colorCtx.createRadialGradient(px, py, 0, px, py, r);
    cg.addColorStop(0, `rgba(${col.r},${col.g},${col.b},1)`);
    cg.addColorStop(innerStop, `rgba(${col.r},${col.g},${col.b},1)`);
    cg.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
    colorCtx.fillStyle = cg;
    colorCtx.beginPath();
    colorCtx.arc(px, py, r, 0, Math.PI * 2);
    colorCtx.fill();
  }

  // 4. Draw the word in white
  const fontSize = Math.min(H * 0.18, W * 0.08);
  ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const wordX = W / 2;
  const wordY = H / 2;
  ctx.fillStyle = '#fff';
  ctx.fillText(word, wordX, wordY);

  // 5. Clip word to spotlight mask: keep only lit word pixels
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  // 6. Tint visible word with spotlight colors
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(colorCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  requestAnimationFrame(render);
}
```

- [ ] **Step 2: Verify**

Open in browser, call `addSpotlight()` from console, see a white circle moving around and revealing the word "LUCE" inside it. Change `S.word` from console — word updates.

- [ ] **Step 3: Commit**

```bash
git add "Workshop_maggio26'/tipografia cinetica/index.html"
git commit -m "feat: implement spotlight-word compositing render pipeline"
```

---

### Task 5: Control panel UI

**Files:**
- Modify: `index.html` (add renderPanel and UI helpers)

- [ ] **Step 1: Add UI helper functions and renderPanel**

Add before `render()`:

```js
// ─── Control Panel ───────────────────────────────────────────────
const panel = document.getElementById('panel');

function renderPanel() {
  panel.innerHTML = '';

  // Master section
  const title = document.createElement('div');
  title.className = 'panel-title';
  title.textContent = 'SPOTLIGHT';
  panel.appendChild(title);

  const f1 = field('Parola', createInput('text', S.word, v => { S.word = v; }));
  panel.appendChild(f1);

  // Channels section
  const sec = document.createElement('div');
  sec.className = 'section-title';
  sec.textContent = 'CANALI';
  panel.appendChild(sec);

  for (const sl of S.spotlights) {
    panel.appendChild(renderChannel(sl));
  }

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.textContent = '+ Aggiungi spotlight';
  addBtn.addEventListener('click', addSpotlight);
  panel.appendChild(addBtn);
}

function renderChannel(sl) {
  const ch = document.createElement('div');
  ch.className = 'channel' + (sl.active ? ' active' : '');

  const hdr = document.createElement('div');
  hdr.className = 'channel-hdr';

  const tog = document.createElement('button');
  tog.className = 'tog ' + (sl.active ? 'on' : 'off');
  tog.textContent = sl.active ? 'ON' : 'OFF';
  tog.addEventListener('click', () => toggleSpotlight(sl.id));
  hdr.appendChild(tog);

  const num = document.createElement('span');
  num.className = 'ch-num';
  num.textContent = 'Spot ' + sl.id;
  hdr.appendChild(num);

  const rm = document.createElement('button');
  rm.className = 'rm';
  rm.textContent = '✕';
  rm.addEventListener('click', () => removeSpotlight(sl.id));
  hdr.appendChild(rm);

  ch.appendChild(hdr);

  ch.appendChild(field('Colore', createColorPicker(sl.color, v => { updateSpotlight(sl.id, { color: v }); renderPanel(); })));
  ch.appendChild(field('Softness', createSlider(0, 1, 0.01, sl.softness, v => { updateSpotlight(sl.id, { softness: v }); }), sl.softness.toFixed(2)));
  ch.appendChild(field('Speed', createSlider(0, 1, 0.01, sl.speed, v => { updateSpotlight(sl.id, { speed: v }); }), sl.speed.toFixed(2)));
  ch.appendChild(field('Wander', createSlider(0, 1, 0.01, sl.wander, v => { updateSpotlight(sl.id, { wander: v }); }), sl.wander.toFixed(2)));

  return ch;
}

// ─── UI helpers ───────────────────────────────────────────────────
function field(label, el, extra) {
  const d = document.createElement('div');
  d.className = 'field';
  const sp = document.createElement('span');
  sp.className = 'label';
  sp.textContent = label;
  d.appendChild(sp);
  d.appendChild(el);
  if (extra !== undefined) {
    const v = document.createElement('span');
    v.className = 'val';
    v.textContent = extra;
    d.appendChild(v);
  }
  return d;
}

function createInput(type, val, cb) {
  const el = document.createElement('input');
  el.className = 'text-input';
  el.type = type;
  el.value = val;
  el.addEventListener('input', () => cb(el.value));
  return el;
}

function createSlider(min, max, step, val, cb) {
  const el = document.createElement('input');
  el.type = 'range';
  el.min = min; el.max = max; el.step = step;
  el.value = val;
  el.addEventListener('input', () => cb(Number(el.value)));
  return el;
}

function createColorPicker(val, cb) {
  const el = document.createElement('input');
  el.type = 'color';
  el.value = val;
  el.addEventListener('input', () => cb(el.value));
  return el;
}

// ─── Init ─────────────────────────────────────────────────────────
// Start with one spotlight
addSpotlight();
renderPanel();
```

- [ ] **Step 2: Verify**

Open in browser — one spotlight channel appears in the panel. Toggle ON/OFF works. Color picker, softness, speed, wander sliders work. Add more spotlights with the button. Remove with ✕. Word input updates the rendered word.

- [ ] **Step 3: Commit**

```bash
git add "Workshop_maggio26'/tipografia cinetica/index.html"
git commit -m "feat: add control panel with channel-based spotlight management"
```

---

### Task 6: Integration polish — handle all edge cases

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add edge case handling**

Add at the end of `render()` before `requestAnimationFrame`:

```js
  // If no active spotlights, canvas stays black — nothing more to do
  if (active.length === 0) {
    requestAnimationFrame(render);
    return;
  }
```

Also ensure that when a spotlight is created via `addSpotlight()`, it starts with a random position:

```js
function addSpotlight() {
  const sl = createSpotlight();
  // Random initial position
  sl.x = Math.random();
  sl.y = Math.random();
  sl.targetX = sl.x;
  sl.targetY = sl.y;
  S.spotlights.push(sl);
  renderPanel();
}
```

- [ ] **Step 2: Final verification**

Open in browser. Test:
- Empty word → black canvas
- All spotlights toggled off → black canvas  
- Add 5+ spotlights → they all move independently
- Toggle individual spotlights on/off
- Remove all spotlights → no errors, panel shows + button
- Change word → updates live
- Resize window → spotlights reposition correctly

- [ ] **Step 3: Commit**

```bash
git add "Workshop_maggio26'/tipografia cinetica/index.html"
git commit -m "chore: polish edge cases and finalize integration"
```
