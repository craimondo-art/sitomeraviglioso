// script.js — Hand Pose Star Tool

let detector = null;
let videoReady = false;
let stream = null;
let stars = [];
let nextId = 0;
let pinchState = 'OPEN';
let tipsClosed = false;
let prevFingertips = null;
let falling = false;

const preview = { active: false, x: 0, y: 0, radius: 0 };

const settings = {
  color: '#FFD700',
  numPoints: 5,
  filled: true,
  strokeWidth: 3
};

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
const camToggle = document.getElementById('cam-toggle');

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

init();

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Browser does not support webcam access');
  }
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => { video.play(); resolve(); };
  });
}

async function setupDetector() {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full'
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);
}

const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20]
];

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

function renderStars() {
  if (falling) {
    const speed = 15;
    for (const s of stars) {
      s.y += speed;
    }
    stars = stars.filter(s => s.y - s.radius < starCanvas.height);
    if (stars.length === 0) {
      falling = false;
    }
  }

  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

  for (const s of stars) {
    drawStar(starCtx, s);
  }

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

function drawKeypoints(kp) {
  const w = overlay.width;
  const h = overlay.height;
  overlayCtx.clearRect(0, 0, w, h);

  overlayCtx.strokeStyle = '#00ff88';
  overlayCtx.lineWidth = 2;
  for (const [i, j] of HAND_CONNECTIONS) {
    overlayCtx.beginPath();
    overlayCtx.moveTo(kp[i].x * w / video.videoWidth, kp[i].y * h / video.videoHeight);
    overlayCtx.lineTo(kp[j].x * w / video.videoWidth, kp[j].y * h / video.videoHeight);
    overlayCtx.stroke();
  }

  for (const p of kp) {
    const cx = p.x * w / video.videoWidth;
    const cy = p.y * h / video.videoHeight;
    overlayCtx.fillStyle = '#ff4444';
    overlayCtx.beginPath();
    overlayCtx.arc(cx, cy, 4, 0, 2 * Math.PI);
    overlayCtx.fill();
  }
}
function resizeCanvases() {
  const videoRect = video.getBoundingClientRect();
  overlay.width = videoRect.width;
  overlay.height = videoRect.height;

  const starRect = starCanvas.getBoundingClientRect();
  starCanvas.width = starRect.width;
  starCanvas.height = starRect.height;
}

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

function processLeftHand(kp) {
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
    preview.active = false;
  } else if (pinchState === 'CLOSED') {
    preview.x = pos.x;
    preview.y = pos.y;
    preview.radius = dist * 2;
  }

  checkSwipeDown(kp);
}

function checkSwipeDown(kp) {
  if (falling) return;

  const tips = [4, 8, 12, 16, 20].map(i => ({ x: kp[i].x, y: kp[i].y }));

  if (!prevFingertips) {
    prevFingertips = tips;
    return;
  }

  const allDown = tips.every((t, i) => (t.y - prevFingertips[i].y) > 4);
  if (allDown && stars.length > 0) {
    falling = true;
    prevFingertips = null;
    return;
  }

  prevFingertips = tips;
}

function checkSaveGesture(kp) {
  const tipIndices = [4, 8, 12, 16, 20];
  const tips = tipIndices.map(i => ({ x: kp[i].x, y: kp[i].y }));
  const cx = tips.reduce((s, t) => s + t.x, 0) / tips.length;
  const cy = tips.reduce((s, t) => s + t.y, 0) / tips.length;
  const maxDist = Math.max(...tips.map(t => distance2D(t, { x: cx, y: cy })));

  const SAVE_THRESHOLD = 40;

  if (!tipsClosed && maxDist < SAVE_THRESHOLD) {
    tipsClosed = true;
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
      pinchState = 'OPEN';
    }
  } else if (maxDist >= SAVE_THRESHOLD) {
    tipsClosed = false;
  }
}

function processHands(hands) {
  const leftHand = hands.find(h => h.handedness === 'Left');
  const rightHand = hands.find(h => h.handedness === 'Right');

  if (leftHand) {
    processLeftHand(leftHand.keypoints);
  } else if (preview.active) {
    preview.active = false;
    pinchState = 'OPEN';
  } else {
    prevFingertips = null;
  }

  if (rightHand && preview.active) {
    checkSaveGesture(rightHand.keypoints);
  }
}

window.addEventListener('resize', resizeCanvases);

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

  camToggle.addEventListener('change', async () => {
    if (camToggle.checked) {
      await setupCamera();
      videoReady = true;
    } else {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      video.srcObject = null;
      videoReady = false;
    }
  });
}

async function mainLoop() {
  resizeCanvases();
  if (detector && videoReady && video.readyState >= 2) {
    const hands = await detector.estimateHands(video);
    if (hands.length > 0) {
      drawKeypoints(hands[0].keypoints);
      processHands(hands);
    } else {
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      prevFingertips = null;
      if (preview.active) {
        preview.active = false;
        renderStars();
      }
    }
  }
  renderStars();
  requestAnimationFrame(mainLoop);
}
