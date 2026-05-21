# Hand Pose Star Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based tool that uses webcam hand tracking (MediaPipe Hands via CDN) to let users create stars by pinching thumb and index finger, with real-time size control via finger separation.

**Architecture:** Three files (index.html, style.css, script.js) with zero build step. CDN-loaded TensorFlow.js + MediaPipe Hands. A canvas on the right side renders stars; a webcam with keypoint overlay is on the left. A console panel below the canvas provides per-star styling controls.

**Tech Stack:** HTML5, CSS3, Vanilla JS, TensorFlow.js (CDN), MediaPipe Hands (CDN)

---

### File Structure

```
marionetta/
  index.html        — HTML skeleton, loads CDN scripts and local CSS/JS
  style.css         — All styles (layout, console, canvas, video)
  script.js         — All JS (HandTracker, PinchDetector, StarEngine, Console, main loop)
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `script.js`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Star Tool — Hand Pose</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <div id="left-panel">
      <video id="webcam" autoplay playsinline></video>
      <canvas id="overlay"></canvas>
    </div>
    <div id="right-panel">
      <canvas id="star-canvas"></canvas>
      <div id="console">
        <label>Color <input type="color" id="star-color" value="#FFD700"></label>
        <label>Points <input type="range" id="star-points" min="3" max="12" value="5"><span id="points-label">5</span></label>
        <label><input type="checkbox" id="star-filled" checked> Filled</label>
        <label>Stroke <input type="range" id="stroke-width" min="1" max="20" value="3" disabled></label>
      </div>
    </div>
  </div>

  <!-- TF.js and MediaPipe via CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection"></script>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create style.css**

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body { height: 100%; overflow: hidden; font-family: system-ui, sans-serif; }

#app {
  display: flex;
  height: 100vh;
}

#left-panel, #right-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
}

#left-panel {
  background: #111;
}

#webcam {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

#overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

#right-panel {
  display: flex;
  flex-direction: column;
  background: #1e1e2e;
}

#star-canvas {
  flex: 1;
  display: block;
  width: 100%;
}

#console {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px 16px;
  background: #2a2a3e;
  border-top: 1px solid #444;
  align-items: center;
  color: #eee;
  font-size: 14px;
}

#console label {
  display: flex;
  align-items: center;
  gap: 6px;
}

#star-color {
  width: 36px;
  height: 36px;
  border: none;
  cursor: pointer;
}

#star-points { width: 100px; }
#stroke-width { width: 80px; }

#console input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

#console span { min-width: 20px; text-align: center; }
```

- [ ] **Step 3: Create script.js (skeleton)**

```js
// script.js — Hand Pose Star Tool

// ---------- State ----------
let detector = null;
let videoReady = false;
let stars = [];
let nextId = 0;
let pinchState = 'OPEN'; // 'OPEN' | 'CLOSED'

const preview = { active: false, x: 0, y: 0, radius: 0 };

const settings = {
  color: '#FFD700',
  numPoints: 5,
  filled: true,
  strokeWidth: 3
};

// ---------- DOM refs ----------
const video = document.getElementById('webcam');
const overlay = document.getElementById('overlay');
const overlayCtx = overlay.getContext('2d');
const starCanvas = document.getElementById('star-canvas');
const starCtx = starCanvas.getContext('2d');
const colorInput = document.getElementById('star-color');
const pointsInput = document.getElementById('star-points');
const pointsLabel = document.getElementById('points-label');
const filledCheck = document.getElementById('star-filled');
const strokeWidthInput = document.getElementById('stroke-width');

// ---------- Init ----------
async function init() {
  try {
    await setupCamera();
    await setupDetector();
    videoReady = true;
    resizeCanvases();
    bindConsole();
    requestAnimationFrame(mainLoop);
  } catch (err) {
    document.body.innerHTML = `<p style="color:red;padding:2rem;">Error: ${err.message}</p>`;
  }
}

init();

// Placeholder — filled in subsequent tasks
async function setupCamera() {}
async function setupDetector() {}
function resizeCanvases() {}
function bindConsole() {}
function mainLoop() {}
```

- [ ] **Step 4: Open the page and verify no console errors**

Run: Open `index.html` in a browser and check browser devtools console
Expected: No errors (just "Error: ..." if no webcam, which is acceptable at this stage)

- [ ] **Step 5: Commit**

```bash
git add index.html style.css script.js
git commit -m "chore: scaffold project structure"
```

---

### Task 2: Camera & Canvas Setup

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Implement setupCamera()**

```js
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser does not support webcam access');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => { video.play(); resolve(); };
  });
}
```

- [ ] **Step 2: Implement resizeCanvases()**

```js
function resizeCanvases() {
  const videoRect = video.getBoundingClientRect();
  overlay.width = videoRect.width;
  overlay.height = videoRect.height;

  const starRect = starCanvas.getBoundingClientRect();
  starCanvas.width = starRect.width;
  starCanvas.height = starRect.height;
}
```

Call `resizeCanvases()` on window resize too:

```js
window.addEventListener('resize', resizeCanvases);
```

- [ ] **Step 3: Verify camera works**

Open `index.html` in browser
Expected: Webcam feed visible on the left panel. No errors.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add camera and canvas resize logic"
```

---

### Task 3: MediaPipe Hand Detector

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Implement setupDetector()**

```js
async function setupDetector() {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'lite'
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);
}
```

- [ ] **Step 2: Implement keypoint overlay rendering**

```js
const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],           // thumb
  [0,5],[5,6],[6,7],[7,8],           // index
  [0,9],[9,10],[10,11],[11,12],      // middle
  [0,13],[13,14],[14,15],[15,16],    // ring
  [0,17],[17,18],[18,19],[19,20]     // pinky
];

function drawKeypoints(kp) {
  const w = overlay.width;
  const h = overlay.height;
  overlayCtx.clearRect(0, 0, w, h);

  // Draw connections
  overlayCtx.strokeStyle = '#00ff88';
  overlayCtx.lineWidth = 2;
  for (const [i, j] of HAND_CONNECTIONS) {
    overlayCtx.beginPath();
    overlayCtx.moveTo(kp[i].x * w / video.videoWidth, kp[i].y * h / video.videoHeight);
    overlayCtx.lineTo(kp[j].x * w / video.videoWidth, kp[j].y * h / video.videoHeight);
    overlayCtx.stroke();
  }

  // Draw keypoints
  for (const p of kp) {
    const cx = p.x * w / video.videoWidth;
    const cy = p.y * h / video.videoHeight;
    overlayCtx.fillStyle = '#ff4444';
    overlayCtx.beginPath();
    overlayCtx.arc(cx, cy, 4, 0, 2 * Math.PI);
    overlayCtx.fill();
  }
}
```

- [ ] **Step 3: Verify hand tracking works**

Load page in browser, show hand to webcam
Expected: 21 red dots with green lines appearing over your hand in the left panel

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add MediaPipe hand detector and keypoint overlay"
```

---

### Task 4: Pinch Detection with Hysteresis

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Implement helper functions**

```js
function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mapToCanvas(midX, midY) {
  const scaleX = starCanvas.width / video.videoWidth;
  const scaleY = starCanvas.height / video.videoHeight;
  return {
    x: Math.max(0, Math.min(starCanvas.width, midX * scaleX)),
    y: Math.max(0, Math.min(starCanvas.height, midY * scaleY))
  };
}
```

- [ ] **Step 2: Add pinch detection logic (inserted in main loop after keypoints are obtained)**

This goes inside the `processHands` function (defined in Task 6) that is called each frame:

```js
function processHands(hands) {
  if (hands.length === 0) {
    if (preview.active) {
      preview.active = false;
      renderStars();
    }
    return;
  }

  const kp = hands[0].keypoints;
  const p4 = { x: kp[4].x, y: kp[4].y };
  const p8 = { x: kp[8].x, y: kp[8].y };
  const dist = distance2D(p4, p8);
  const midX = (p4.x + p8.x) / 2;
  const midY = (p4.y + p8.y) / 2;
  const pos = mapToCanvas(midX, midY);

  const PINCH_CLOSE = 30;
  const PINCH_OPEN = 50;

  if (pinchState === 'OPEN' && dist < PINCH_CLOSE) {
    pinchState = 'CLOSED';
    preview.active = true;
    preview.x = pos.x;
    preview.y = pos.y;
    preview.radius = dist * 2;
  } else if (pinchState === 'CLOSED' && dist > PINCH_OPEN) {
    pinchState = 'OPEN';
    if (preview.active) {
      stars.push({
        id: nextId++,
        x: preview.x,
        y: preview.y,
        radius: preview.radius,
        color: settings.color,
        numPoints: settings.numPoints,
        filled: settings.filled,
        strokeWidth: settings.strokeWidth
      });
      preview.active = false;
    }
  } else if (pinchState === 'CLOSED') {
    preview.x = pos.x;
    preview.y = pos.y;
    preview.radius = dist * 2;
  }
}
```

- [ ] **Step 3: Verify pinch detection**

After completing Task 6 integration, test:
Expected: Bring thumb and index close → state changes. The distance logic works.

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add pinch detection with hysteresis"
```

---

### Task 5: Star Rendering Engine

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Implement star vertex calculation**

```js
function starVertices(cx, cy, outerR, innerR, numPoints) {
  const verts = [];
  const step = Math.PI / numPoints;
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    verts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return verts;
}
```

- [ ] **Step 2: Implement drawStar function**

```js
function drawStar(ctx, s) {
  const innerR = s.radius * 0.4;
  const verts = starVertices(s.x, s.y, s.radius, innerR, s.numPoints);
  ctx.beginPath();
  ctx.moveTo(verts[0].x, verts[0].y);
  for (let i = 1; i < verts.length; i++) {
    ctx.lineTo(verts[i].x, verts[i].y);
  }
  ctx.closePath();

  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.strokeWidth;

  if (s.filled) {
    ctx.fillStyle = s.color;
    ctx.fill();
  } else {
    ctx.stroke();
  }
}
```

- [ ] **Step 3: Implement renderStars()**

```js
function renderStars() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

  // Draw finalized stars
  for (const s of stars) {
    drawStar(starCtx, s);
  }

  // Draw preview star (semi-transparent)
  if (preview.active) {
    starCtx.globalAlpha = 0.4;
    drawStar(starCtx, {
      x: preview.x, y: preview.y, radius: preview.radius,
      numPoints: settings.numPoints, color: settings.color,
      filled: settings.filled, strokeWidth: settings.strokeWidth
    });
    starCtx.globalAlpha = 1.0;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: add star geometry and rendering engine"
```

---

### Task 6: Console & Main Loop Integration

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Implement bindConsole()**

```js
function bindConsole() {
  colorInput.addEventListener('input', () => {
    settings.color = colorInput.value;
  });

  pointsInput.addEventListener('input', () => {
    settings.numPoints = parseInt(pointsInput.value);
    pointsLabel.textContent = settings.numPoints;
  });

  filledCheck.addEventListener('change', () => {
    settings.filled = filledCheck.checked;
    strokeWidthInput.disabled = filledCheck.checked;
  });

  strokeWidthInput.addEventListener('input', () => {
    settings.strokeWidth = parseInt(strokeWidthInput.value);
  });
}
```

- [ ] **Step 2: Implement mainLoop()**

```js
async function mainLoop() {
  resizeCanvases();
  if (detector && videoReady && video.readyState >= 2) {
    const hands = await detector.estimateHands(video);
    if (hands.length > 0) {
      drawKeypoints(hands[0].keypoints);
      processHands(hands);
    } else {
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      if (preview.active) {
        preview.active = false;
        renderStars();
      }
    }
  }
  renderStars();
  requestAnimationFrame(mainLoop);
}
```

- [ ] **Step 3: Full end-to-end test**

Open `index.html`
Expected:
- Webcam shows on left with keypoints overlay
- Console controls visible and interactive
- Pinch thumb+index → preview star appears on right canvas
- Open fingers → star is finalized on canvas
- Change color/points/fill → next star uses new settings
- Existing stars are not modified by settings changes

- [ ] **Step 4: Commit**

```bash
git add script.js
git commit -m "feat: wire up console, main loop, and full integration"
```

---

### Task 7: Edge Cases & Polish

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `script.js`

- [ ] **Step 1: Add camera permission error handling (already partially done in init)**

Ensure the error message is styled:

```css
/* Add to style.css */
.error-message {
  color: #ff6b6b;
  padding: 2rem;
  font-size: 1.2rem;
  text-align: center;
  background: #1e1e2e;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Update error handling in init():

```js
async function init() {
  try {
    await setupCamera();
    await setupDetector();
    videoReady = true;
    resizeCanvases();
    bindConsole();
    requestAnimationFrame(mainLoop);
  } catch (err) {
    document.body.innerHTML = `<p class="error-message">${err.message}</p>`;
  }
}
```

- [ ] **Step 2: Handle slow/no hand detection gracefully**

In `mainLoop`, when no hands are detected, ensure the overlay is cleared and preview is cancelled:

```js
// Already handled — processHands clears preview when hands.length === 0
```

- [ ] **Step 3: Verify all edge cases**

Test scenarios:
1. No webcam permission → styled error message shown
2. No hand in frame → left panel shows video with no overlay, right panel unchanged
3. Pinch rapidly → each release creates a new star at current position
4. Change settings between stars → each star respects settings at its creation time
5. Window resize → canvases resize properly (call resizeCanvases in mainLoop handles this)

- [ ] **Step 4: Commit**

```bash
git add index.html style.css script.js
git commit -m "feat: polish edge cases and error handling"
```
