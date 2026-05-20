# Pancake Recipe Web Tool — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-file HTML page displaying the pancake recipe with dose scaling, checkable steps with time estimates, and confetti animations.

**Architecture:** Single `.html` file at `ricetta/codebase/index.html` with inline CSS and JS. Recipe data hardcoded as JS objects. No dependencies, no build step.

**Tech Stack:** Vanilla HTML5, CSS3 (animations, clip-path for zigzag border), vanilla JS (ES6).

---

### Task 1: HTML skeleton with recipe data and ingredient list

**Files:**
- Create: `ricetta/codebase/index.html`

- [ ] **Step 1: Create the file with HTML structure, recipe data JS, and ingredient list**

```html
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ricetta Pancakes</title>
<style>
  /* reset & base */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5e6d0;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }
  .container { max-width: 600px; width: 100%; }
  h1 {
    text-align: center;
    font-size: 2rem;
    color: #3d2b1f;
    margin-bottom: 16px;
    font-weight: 700;
  }
  /* people counter */
  .people-box {
    background: #fff;
    border: 2px solid #d4a574;
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 1.1rem;
    color: #3d2b1f;
  }
  .people-box label { font-weight: 600; }
  .people-box input {
    width: 60px;
    padding: 6px 10px;
    font-size: 1.1rem;
    text-align: center;
    border: 2px solid #d4a574;
    border-radius: 8px;
    outline: none;
    font-weight: 600;
  }
  .people-box input:focus { border-color: #b87333; }
  /* scontrino card */
  .scontrino {
    background: #fff;
    padding: 28px 24px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    clip-path: polygon(
      0% 8px, 8px 0%, 16px 8px, 24px 0%, 32px 8px, 40px 0%, 48px 8px,
      56px 0%, 64px 8px, 72px 0%, 80px 8px, 88px 0%, 96px 8px,
      100% 0%, 100% calc(100% - 8px),
      calc(100% - 8px) 100%, calc(100% - 16px) calc(100% - 8px),
      calc(100% - 24px) 100%, calc(100% - 32px) calc(100% - 8px),
      calc(100% - 40px) 100%, calc(100% - 48px) calc(100% - 8px),
      calc(100% - 56px) 100%, calc(100% - 64px) calc(100% - 8px),
      calc(100% - 72px) 100%, calc(100% - 80px) calc(100% - 8px),
      calc(100% - 88px) 100%, calc(100% - 96px) calc(100% - 8px),
      0% 100%
    );
  }
  .scontrino h2 {
    font-size: 1.3rem;
    color: #3d2b1f;
    margin-bottom: 14px;
    border-bottom: 1px dashed #ccc;
    padding-bottom: 8px;
  }
  .ingredienti-list { list-style: none; margin-bottom: 24px; }
  .ingredienti-list li {
    padding: 5px 0;
    font-size: 1rem;
    color: #444;
    display: flex;
    justify-content: space-between;
  }
  .ingredienti-list li .nome { font-weight: 500; }
  .ingredienti-list li .qta { font-weight: 600; color: #3d2b1f; }
  /* steps */
  .steps-list { list-style: none; counter-reset: step; }
  .steps-list li {
    counter-increment: step;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .steps-list li:last-child { border-bottom: none; }
  .steps-list li .step-num {
    font-weight: 700;
    color: #b87333;
    min-width: 24px;
  }
  .steps-list li .step-text { flex: 1; color: #444; line-height: 1.4; }
  .steps-list li .step-time {
    font-size: 0.85rem;
    color: #888;
    white-space: nowrap;
    padding-top: 2px;
  }
  .steps-list li input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: #b87333;
    cursor: pointer;
    flex-shrink: 0;
  }
  .steps-list li.done .step-text { text-decoration: line-through; color: #aaa; }
  .steps-list li.done .step-time { color: #bbb; }
</style>
</head>
<body>
<div class="container">
  <h1>Ricetta Pancakes</h1>
  <div class="people-box">
    <label for="people">Persone:</label>
    <input type="number" id="people" value="2" min="1" max="20">
  </div>
  <div class="scontrino" id="scontrino">
    <h2>Ingredienti</h2>
    <ul class="ingredienti-list" id="ingredienti-list"></ul>
    <h2>Procedimento</h2>
    <ol class="steps-list" id="steps-list"></ol>
  </div>
</div>
<script>
const recipeData = {
  basePeople: 2,
  ingredients: [
    { name: 'Farina 00', qta: 125, unit: 'g', scalable: true },
    { name: 'Latte intero', qta: 200, unit: 'g', scalable: true },
    { name: 'Burro', qta: 25, unit: 'g', scalable: true },
    { name: 'Zucchero', qta: 15, unit: 'g', scalable: true },
    { name: 'Uova medie', qta: 2, unit: '', scalable: true, format: (v) => Math.round(v) },
    { name: 'Lievito per dolci', qta: 6, unit: 'g', scalable: true },
    { name: 'Sale fino', qta: 1, unit: 'pizzico', scalable: false },
    { name: 'Burro per ungere', qta: null, unit: 'q.b.', scalable: false },
  ],
  steps: [
    { text: 'Sciogliere il burro in un pentolino e lasciare intiepidire.', time: '1 min' },
    { text: 'Separare i tuorli dagli albumi.', time: '2 min' },
    { text: 'Versare nella ciotola con i tuorli il burro fuso intiepidito e il latte. Mescolare con una frusta.', time: '2 min' },
    { text: 'Setacciare la farina e il lievito, incorporare le polveri con la frusta, aggiungere il sale e mescolare fino a ottenere un composto omogeneo.', time: '3 min' },
    { text: 'Montare gli albumi a neve con le fruste elettriche, versando gradualmente lo zucchero.', time: '4 min' },
    { text: 'Aggiungere gli albumi montati al composto di tuorli e mescolare delicatamente dal basso verso l\'alto.', time: '2 min' },
    { text: 'Cuocere i pancake in padella antiaderente con poco burro, 2 min per lato, fino a doratura.', time: '12 min' },
  ]
};

function renderIngredients(people) {
  const factor = people / recipeData.basePeople;
  const list = document.getElementById('ingredienti-list');
  list.innerHTML = '';
  recipeData.ingredients.forEach(ing => {
    const li = document.createElement('li');
    let qtaStr;
    if (!ing.scalable) {
      qtaStr = ing.unit;
    } else if (ing.format) {
      qtaStr = ing.format(ing.qta * factor) + ' ' + ing.unit;
    } else {
      qtaStr = Math.round(ing.qta * factor) + ' ' + ing.unit;
    }
    li.innerHTML = `<span class="nome">${ing.name}</span><span class="qta">${qtaStr}</span>`;
    list.appendChild(li);
  });
}

function renderSteps() {
  const list = document.getElementById('steps-list');
  list.innerHTML = '';
  recipeData.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <input type="checkbox" data-step="${i}">
      <span class="step-num">${i + 1}.</span>
      <span class="step-text">${step.text}</span>
      <span class="step-time">⏱ ${step.time}</span>
    `;
    list.appendChild(li);
  });
}

document.getElementById('people').addEventListener('input', function () {
  let val = parseInt(this.value) || 1;
  if (val < 1) val = 1;
  if (val > 20) val = 20;
  renderIngredients(val);
});

renderIngredients(2);
renderSteps();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify the file opens in browser**

Run: `open "/Users/clarissaraimondo/Desktop/Workshop_maggio26/Workshop_maggio26'/ricetta/codebase/index.html"`
Expected: Browser opens showing title, people input, ingredient list, step list. No console errors.

- [ ] **Step 3: Commit**

```bash
git add "Workshop_maggio26'/ricetta/codebase/index.html"
git commit -m "feat: add pancake recipe tool with ingredient scaling and steps"
```
(workdir: root of repo)

---

### Task 2: Confetti animation on checkbox check

- [ ] **Step 1: Add confetti CSS keyframes and styles**

Add inside the `<style>` block (before `</style>`):

```css
/* confetti */
@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  60% { opacity: 1; }
  100% { transform: translateY(-350px) rotate(720deg); opacity: 0; }
}
.confetti-piece {
  position: fixed;
  width: 8px;
  height: 12px;
  border-radius: 2px;
  pointer-events: none;
  z-index: 100;
}
```

- [ ] **Step 2: Add confetti trigger function in JS**

Add before `document.getElementById('people')`:

```js
const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff8fab','#c084fc','#fb923c','#67e8f9'];

function spawnConfetti() {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.background = color;
    const startX = Math.random() * 300 - 150;
    const endX = (Math.random() - 0.5) * 300;
    el.style.left = `calc(50% + ${startX}px)`;
    el.style.bottom = '0px';
    el.style.animation = `confetti-fall ${0.8 + Math.random() * 0.7}s ease-out forwards`;
    el.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}
```

- [ ] **Step 3: Wire checkbox change listener**

Add to the `renderSteps` function, after `list.appendChild(li)`:

```js
    const cb = li.querySelector('input[type="checkbox"]');
    cb.addEventListener('change', function () {
      li.classList.toggle('done', this.checked);
      if (this.checked) spawnConfetti();
    });
```

- [ ] **Step 4: Verify confetti works**

Run: `open "/Users/..."` — check each step, verify confetti animations on check and strikethrough on text.

- [ ] **Step 5: Commit**

```bash
git add "Workshop_maggio26'/ricetta/codebase/index.html"
git commit -m "feat: add confetti animation on step completion"
```
(workdir: root of repo)
