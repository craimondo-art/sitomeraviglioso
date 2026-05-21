# Pancake Recipe Web Tool — Design

## Overview
Single-page HTML tool that displays the Ricetta Pancakes in a receipt-style "scontrino" card with interactive features: dose scaling by number of people, checkable steps with time estimates, and confetti animations on step completion.

## Architecture
Single `.html` file in `ricetta/codebase/index.html`. CSS and JS embedded inline. Zero dependencies.

## Layout (top to bottom)
1. **Header**: "Ricetta Pancakes" title, centered
2. **People input box**: Numeric input (`<input type="number">`) with label "Persone:", default value 2, positioned above the recipe card
3. **Recipe card (scontrino)**: White background card with jagged/zigzag top and bottom borders, containing:
   - **Ingredienti section**: List of ingredients with quantities that update live when people count changes
   - **Procedimento section**: Numbered steps, each with a checkbox on the left and a time estimate on the right
4. **Confetti**: `<div>` rectangles animated from behind the card bottom edge, curving upward and fading out

## Dose scaling
- Base recipe = 2 persone
- Multiplier = persone / 2
- Quantities are rounded to sensible precision (grams → integer, eggs → integer, salt → "1 pizzico" unchanged)
- Update on `input` event — no button needed

## Steps with time estimates
| Step | Time |
|------|------|
| 1. Sciogliere il burro e lasciare intiepidire | 1 min |
| 2. Separare tuorli e albumi | 2 min |
| 3. Mescolare tuorli, burro fuso e latte con frusta | 2 min |
| 4. Setacciare e incorporare farina, lievito, sale | 3 min |
| 5. Montare albumi a neve con zucchero | 4 min |
| 6. Incorporare albumi al composto delicatamente | 2 min |
| 7. Cuocere i pancake (2 min per lato) | 12 min |

## Checkbox behavior
- Each step has a `<input type="checkbox">`
- When checked → trigger confetti animation
- Checked state persists visually (strikethrough or dimmed text)

## Confetti animation
- 15-20 `<div>` rectangles per trigger
- Random colors (pastel/bright)
- Start position: hidden behind card bottom edge
- Trajectory: arc upward and outward (CSS `@keyframes` with random `animation-duration` 0.8-1.5s, random horizontal offset)
- Opacity fades to 0 at ~50-60% of animation
- Rotation applied randomly
- Removed from DOM after animation ends

## Styling
- Font: system sans-serif
- Card: white background, rounded corners + CSS zigzag top/bottom using `clip-path` or SVG background, subtle shadow
- Background behind card: light warm color (paper-adjacent)
- Responsive: max-width ~600px, centered

## Files
- `ricetta/codebase/index.html` — single file containing everything
- Recipe data read from `Ricetta Pancakes.md` (converted to inline JS data)
