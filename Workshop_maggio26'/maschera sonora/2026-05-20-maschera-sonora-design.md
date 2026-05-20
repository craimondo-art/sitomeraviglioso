# Maschera Sonora — Sound-Responsive SVG Animation

## Overview

Web-based sound-responsive animation that interpolates between two SVG states ("silenzio" → "parla") using real-time microphone volume input. Built with vanilla JavaScript, zero dependencies.

## Audio Pipeline

1. `getUserMedia` captures microphone audio
2. `AnalyserNode` computes RMS (root mean square) volume per frame
3. Exponential moving average (EMA) smooths the signal: `smooth = alpha * raw + (1 - alpha) * smooth`
4. Interpolation factor: `t = clamp(RMS / soglia, 0, 1)`
   - t=0 → "silenzio" state
   - t=1 → "parla" state

## Soglia (Threshold) Slider

- Range: 0.05 – 1.0, default ~0.3
- Low value → high sensitivity (quiet sounds trigger animation)
- High value → low sensitivity (only loud sounds trigger animation)
- Mapped as: `t = clamp(RMS / sogliaValue, 0, 1)`

## SVG Interpolation Strategy

Each facial element is matched between the two SVGs and interpolated:

| Element | Strategy |
|---|---|
| bocca (path cls-4, cls-2, cls-1) | Coordinate-per-coordinate interpolation of `d` attribute |
| farfallino | Convert polygon `points` to path `d`, then interpolate |
| guance | Coordinate interpolation of `d` |
| sopracciglia | Convert polygon `points` to path `d` (1_parla), then interpolate |
| naso | Coordinate interpolation of `d` |
| occhi | Coordinate interpolation of `d` (trim to common command count) |

Polygon → Path conversion: `points="x1,y1 x2,y2..."` → `M x1 y1 L x2 y2 L x3 y3 ... Z`

Where path command counts differ between the two states, the shorter path is padded by repeating the last coordinate to avoid visual jumps.

## UI

- Dark background, centered SVG mask
- Slider "soglia" at bottom with label and numeric value display
- Live volume indicator (bar or numeric)

## File Structure

```
maschera sonora/
├── index.html
├── style.css
├── script.js
└── svg/
    ├── 1_parla.svg
    └── 2_silenzio.svg
```

## States

- **Initial**: t=0 (silenzio), microphone not yet active — user must click to enable audio
- **Active**: microphone streaming, animation responding to volume in real-time
- **No audio / silent**: naturally stays at or near t=0 (silenzio)
