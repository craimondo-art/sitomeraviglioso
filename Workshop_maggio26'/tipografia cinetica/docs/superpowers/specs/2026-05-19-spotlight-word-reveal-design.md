# Spotlight Word Reveal

## Overview

A minimal web tool that lets the user type any word, which stays completely invisible against a black background, and is gradually revealed — letter by letter — by one or more circular spotlights that wander smoothly across the canvas. Each spotlight has its own color, edge softness, speed, and wander amount.

Replaces the existing "tipografia cinetica" stage-lighting simulator.

## Architecture

Single HTML file, no dependencies. Canvas 2D rendering with offscreen compositing.

## Rendering Pipeline

Every frame:

1. Clear canvas to black (`#000`)
2. Update each active spotlight's position (smooth random walk)
3. Render all spotlight gradients onto two offscreen canvases:
   - **Luminosity mask** — white radial gradients blended with `globalCompositeOperation = 'lighter'`
   - **Color layer** — colored radial gradients, same positions, also `'lighter'`
4. Draw the word in white on the main canvas
5. `globalCompositeOperation = 'destination-in'` — clip word to luminosity mask
6. `globalCompositeOperation = 'source-atop'` — tint the visible word with the color layer

Result: the word is fully black/invisible where no spotlight hits, and colored by the spotlights where it does.

## Movement System

Each spotlight holds `{ x, y, vx, vy }`. Every ~2 seconds a new `targetX, targetY` is chosen randomly. The spotlight accelerates smoothly toward the target.

- **Speed** slider — controls acceleration strength
- **Wander** slider — controls the radius within which the target is chosen (0 = no movement, max = full canvas)

Spotlights gently bounce off canvas edges.

## Controls Layout

Side panel (dark theme) with two sections:

### MASTER
- **Parola** — text input (default: empty or "LUCE")

### SPOTLIGHT (one per channel)
Each channel card shows:
- Toggle ON/OFF button
- **Colore** — color picker
- **Softness** — slider 0–1 (0 = hard edge, 1 = very soft edge)
- **Speed** — slider
- **Wander** — slider
- **✕** — remove this channel

Bottom: **+ Aggiungi spotlight** button

No light types, no 3D stage, no floor, no gobos — just spotlights.

## Edge Cases

- Empty word: show nothing (or a placeholder prompt)
- All spotlights off: canvas stays black
- Adding a spotlight: spawns at a random position
- Removing a spotlight: removed immediately
- Single spotlight: works fine, movement as expected
- 10+ spotlights: should still be performant (canvas compositing is cheap)
