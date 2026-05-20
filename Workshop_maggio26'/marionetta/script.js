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

async function setupDetector() {}
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
