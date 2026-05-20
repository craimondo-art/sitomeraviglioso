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

async function setupCamera() {}
async function setupDetector() {}
function resizeCanvases() {}
function bindConsole() {}
function mainLoop() {}
