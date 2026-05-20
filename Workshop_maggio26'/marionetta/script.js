// script.js — Hand Pose Star Tool

let detector = null;
let videoReady = false;
let stars = [];
let nextId = 0;
let pinchState = 'OPEN';

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
  const stream = await navigator.mediaDevices.getUserMedia({
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
    modelType: 'lite'
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

window.addEventListener('resize', resizeCanvases);

function bindConsole() {}
function mainLoop() {}
