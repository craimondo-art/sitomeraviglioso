# Hand Pose Star Tool — Design Spec

## Overview
A browser-based web tool that uses MediaPipe Hands via TensorFlow.js to let users create stars on a canvas by pinching thumb and index finger in front of a webcam. Star size is controlled in real-time by finger separation distance.

## Tech Stack
- **Runtime**: CDN-only (zero build steps). Single `index.html` with `<script>` tags.
- **Libraries**:
  - `@tensorflow-models/hand-pose-detection` (MediaPipe Hands)
  - `@mediapipe/hands` (MediaPipe runtime)
  - `@tensorflow/tfjs-core`, `@tensorflow/tfjs-converter`, `@tensorflow/tfjs-backend-webgl`
- **Model**: `MediaPipeHands` with `modelType: 'lite'` (balance of speed and accuracy)

## Layout (Split Screen)
```
┌──────────────────────┬──────────────────────────┐
│                      │                          │
│   WEBCAM (50%)       │   STAR CANVAS (50%)      │
│   with hand overlay  │   where stars appear     │
│   21 keypoints drawn │                          │
│                      │                          │
├──────────────────────┴──────────────────────────┤
│              CONSOLE (below canvas)               │
│  [Color ▼]  [Points: 5]  [◉ Fill / ○ Stroke]  [↔ 3px]│
└─────────────────────────────────────────────────┘
```

Left side: raw webcam feed with the 21 MediaPipe keypoints overlaid.
Right side: canvas where stars are drawn. Console strip sits below the canvas.

## Components

### 1. HandTracker
- Initializes MediaPipe Hands detector via CDN scripts
- Processes each webcam frame through `detector.estimateHands(video)`
- Returns array of keypoints for the first detected hand
- Renders keypoint dots + connections on an overlay canvas above the video

### 2. PinchDetector
- At each frame, computes Euclidean distance between keypoint 4 (thumb_tip) and keypoint 8 (index_finger_tip)
- Applies hysteresis to avoid flicker:
  - Pinch CLOSED threshold: distance < 30px
  - Pinch OPEN threshold: distance > 50px
  - Between 30-50px: maintain previous state

### 3. StarEngine
- When pinch transitions CLOSED: begin creating a star
  - Use current hand position (mapped to canvas coordinates) as star center
  - Set initial radius based on current distance 4↔8
- While pinch stays CLOSED: update star radius = current distance 4↔8 × scale factor
  - Render a semi-transparent preview star on canvas
- When pinch transitions OPEN (released): finalize star
  - Create a `Star` object with current settings from Console
  - Add to master star list
  - Render permanently on canvas

### 4. StarCanvas
- Renders all finalized stars on the right-side canvas
- During pinch, renders the preview star (semi-transparent, real-time resize)
- Each star is drawn as a polygon:
  - Outer vertices at radius distance
  - Inner vertices at radius × 0.4 (for classic star points)
  - Alternating inner/outer vertices based on `numPoints`

### 5. Console
Input controls (settable before each star creation):
- **Color**: `<input type="color">` (default: `#FFD700` gold)
- **Points**: `<input type="range" min="3" max="12" value="5">` + label
- **Fill/Stroke**: toggle (`<input type="radio">` or toggle button)
- **Stroke Width**: `<input type="range" min="1" max="20" value="3">` (only active if Stroke mode)
Changes affect only stars created afterward. Existing stars are immutable.

## Data Model

```js
// Current console settings
const settings = {
  color: '#FFD700',
  numPoints: 5,
  filled: true,
  strokeWidth: 3
}

// Each star
const star = {
  id: uniqueId(),
  x: number,         // canvas pixel coords
  y: number,
  radius: number,    // final radius in px
  color: string,
  numPoints: number,
  filled: boolean,
  strokeWidth: number
}

// Master list
const stars = [star, star, ...]

// Transient preview state (during pinch)
const preview = {
  active: boolean,
  x: number,
  y: number,
  radius: number
}
```

## Data Flow

```
Webcam frame
  →
HandTracker.estimateHands(video)
  → keypoints[21]
  →
PinchDetector:
  dist = distance(keypoints[4], keypoints[8])
  if dist < 30: pinchState = CLOSED
  if dist > 50: pinchState = OPEN
  
  On CLOSED→OPEN transition:
    finalize star with current settings
    add to stars[]
    render on canvas
  
  While CLOSED:
    update preview.radius = dist × scaleFactor
    update preview.x, preview.y from hand position
    render preview on canvas (semi-transparent)
```

## Hand Position → Canvas Mapping
The webcam video and the star canvas are different sizes. The mapping:
- Take the midpoint between thumb_tip (keypoint 4) and index_tip (keypoint 8) in video pixel space
- Scale proportionally: `canvasX = (midX / videoWidth) × canvasWidth`, same for Y
- Clamp to canvas bounds

## Edge Cases
- **No hand detected**: canvas stays idle, no preview shown
- **Multiple hands detected**: use only the first hand (highest score)
- **Rapid pinch spam**: star is created on each release; no cooldown needed since each frame is processed
- **Browser without webcam**: show error message asking user to enable camera permissions
- **Slow frame rate**: star preview updates at whatever rate MediaPipe delivers frames; no buffering needed

## Files
Single `index.html` file containing all HTML, CSS, and JS (inline `<style>` and `<script>`). This keeps the project simple to serve — just open in a browser or use any static file server.

## Future Possibilities (out of scope for v1)
- Undo/redo
- Save canvas as image
- Star deletion (tap on star? gesture?)
- Multi-hand support
- Background color picker
- Star rotation control
