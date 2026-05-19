# Tipografia Cinetica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-page 3D web tool where users type a word and light it with up to 3 combinable stage lighting effects (Fresnel, Moving Head, Gobo, Diffusore, Strobo) via a mixer-panel UI.

**Architecture:** Vite + React app with a split layout — left side is a Three.js scene (via @react-three/fiber) rendering the word as 3D text on a stage; right side is a Zustand-driven mixer panel with toggles, sliders, and color pickers per light channel.

**Tech Stack:** Vite, React 18, @react-three/fiber, @react-three/drei, Three.js, Zustand, Vitest

---

### Task 1: Scaffold Vite + React project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "tipografia-cinetica",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "vitest": "^1.1.0",
    "@testing-library/react": "^14.1.0",
    "jsdom": "^23.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tipografia Cinetica</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create src/main.jsx**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: node_modules created, lockfile generated

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold vite + react project"
```

---

### Task 2: Write Zustand store

**Files:**
- Create: `src/store.js`
- Create: `src/store.test.js`

- [ ] **Step 1: Write the store**

```js
import { create } from 'zustand';

let nextId = 1;

const defaultParams = {
  fresnel: { beamAngle: 45, softness: 0.5 },
  movinghead: { speed: 2 },
  gobo: { goboPattern: 'circle', goboRotation: 0, goboScale: 1 },
  diffusore: { spread: 5 },
  strobo: { frequency: 5 },
};

function makeLight(type) {
  const id = `light-${nextId++}`;
  return {
    id,
    type,
    active: false,
    color: '#ffffff',
    intensity: 0.5,
    position: { x: 0, y: 3, z: 3 },
    ...defaultParams[type],
  };
}

export const useStore = create((set, get) => ({
  word: 'LUCE',
  masterIntensity: 1,
  lights: [],

  addLight(type) {
    const { lights } = get();
    if (lights.length >= 3) return { error: 'Limite massimo 3 luci raggiunto' };
    set({ lights: [...lights, makeLight(type)] });
  },

  removeLight(id) {
    set({ lights: get().lights.filter((l) => l.id !== id) });
  },

  toggleLight(id) {
    const activeCount = get().lights.filter((l) => l.active && l.id !== id).length;
    set({
      lights: get().lights.map((l) => {
        if (l.id !== id) return l;
        const nextActive = !l.active;
        if (nextActive && activeCount >= 3) return l;
        return { ...l, active: nextActive };
      }),
    });
  },

  updateLight(id, partial) {
    set({
      lights: get().lights.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    });
  },

  setWord(word) {
    set({ word });
  },

  setMasterIntensity(v) {
    set({ masterIntensity: v });
  },
}));
```

- [ ] **Step 2: Write store test**

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';

beforeEach(() => {
  useStore.setState({ word: 'LUCE', masterIntensity: 1, lights: [] });
});

describe('store', () => {
  it('adds a light', () => {
    useStore.getState().addLight('fresnel');
    expect(useStore.getState().lights).toHaveLength(1);
    expect(useStore.getState().lights[0].type).toBe('fresnel');
  });

  it('removes a light', () => {
    useStore.getState().addLight('fresnel');
    const id = useStore.getState().lights[0].id;
    useStore.getState().removeLight(id);
    expect(useStore.getState().lights).toHaveLength(0);
  });

  it('limits active lights to 3', () => {
    useStore.getState().addLight('fresnel');
    useStore.getState().addLight('movinghead');
    useStore.getState().addLight('gobo');
    const lights = useStore.getState().lights;
    lights.forEach((l) => useStore.getState().toggleLight(l.id));
    useStore.getState().addLight('strobo');
    const l4 = useStore.getState().lights[3];
    const result = useStore.getState().toggleLight(l4.id);
    expect(l4.active).toBe(false);
    expect(result?.error).toBeDefined();
  });

  it('updates a light param', () => {
    useStore.getState().addLight('fresnel');
    const id = useStore.getState().lights[0].id;
    useStore.getState().updateLight(id, { intensity: 0.8 });
    expect(useStore.getState().lights[0].intensity).toBe(0.8);
  });

  it('sets word and master intensity', () => {
    useStore.getState().setWord('OMBRA');
    expect(useStore.getState().word).toBe('OMBRA');
    useStore.getState().setMasterIntensity(0.5);
    expect(useStore.getState().masterIntensity).toBe(0.5);
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npx vitest run`
Expected: All 6 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/store.js src/store.test.js
git commit -m "feat: add zustand store with tests"
```

---

### Task 3: Create App shell with 2-column layout

**Files:**
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: Write App.jsx**

```jsx
import Scene3D from './Scene3D';
import MixerPanel from './controls/MixerPanel';

export default function App() {
  return (
    <div className="app">
      <div className="scene-panel">
        <Scene3D />
      </div>
      <div className="mixer-panel">
        <MixerPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write App.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0a0a;
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.app {
  display: flex;
  width: 100%;
  height: 100vh;
}

.scene-panel {
  flex: 1;
  height: 100%;
}

.mixer-panel {
  width: 340px;
  min-width: 340px;
  height: 100%;
  background: #141414;
  border-left: 1px solid #2a2a2a;
  overflow-y: auto;
  padding: 16px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/App.css
git commit -m "feat: add app shell with 2-column layout"
```

---

### Task 4: Scene3D, Stage, and TextMesh

**Files:**
- Create: `src/Scene3D.jsx`
- Create: `src/Stage.jsx`
- Create: `src/TextMesh.jsx`

- [ ] **Step 1: Write Scene3D.jsx**

```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Stage from './Stage';
import TextMesh from './TextMesh';
import LightsRenderer from './lights/LightsRenderer';

export default function Scene3D() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 6], fov: 50 }}
      gl={{ toneMapping: 3, toneMappingExposure: 1 }}
    >
      <color attach="background" args={['#0a0a0a']} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
      <ambientLight intensity={0.05} />
      <Stage />
      <TextMesh />
      <LightsRenderer />
    </Canvas>
  );
}
```

- [ ] **Step 2: Write Stage.jsx**

```jsx
import { useStore } from './store';

export default function Stage() {
  const masterIntensity = useStore((s) => s.masterIntensity);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <shadowMaterial opacity={0.4 * masterIntensity} color="#000" />
    </mesh>
  );
}
```

- [ ] **Step 3: Write TextMesh.jsx**

```jsx
import { useStore } from './store';

export default function TextMesh() {
  const word = useStore((s) => s.word);
  return (
    <group position={[0, 0.2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[word.length * 0.5, 0.3, 0.1]} />
        <meshStandardMaterial color="#888" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}
```

(Note: Using a box as placeholder text geometry will be replaced when the drei Text component is available. For a real font-based text, switch to drei's `<Text>` component using `@react-three/drei`.)

- [ ] **Step 4: Run dev server to verify**

Run: `npm run dev`
Open browser — should see a dark scene with a flat box and orbit controls.
Expected: scene renders, no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/Scene3D.jsx src/Stage.jsx src/TextMesh.jsx
git commit -m "feat: add 3D scene, stage, and text mesh"
```

---

### Task 5: LightsRenderer — render active 3D lights in scene

**Files:**
- Create: `src/lights/LightsRenderer.jsx`
- Create: `src/lights/Fresnel.jsx`
- Create: `src/lights/MovingHead.jsx`
- Create: `src/lights/Gobo.jsx`
- Create: `src/lights/Diffusore.jsx`
- Create: `src/lights/Strobo.jsx`

- [ ] **Step 1: Write LightsRenderer.jsx**

```jsx
import { useStore } from '../store';
import Fresnel from './Fresnel';
import MovingHead from './MovingHead';
import Gobo from './Gobo';
import Diffusore from './Diffusore';
import Strobo from './Strobo';

const lightComponents = {
  fresnel: Fresnel,
  movinghead: MovingHead,
  gobo: Gobo,
  diffusore: Diffusore,
  strobo: Strobo,
};

export default function LightsRenderer() {
  const lights = useStore((s) => s.lights);
  const masterIntensity = useStore((s) => s.masterIntensity);

  return lights
    .filter((l) => l.active)
    .map((l) => {
      const C = lightComponents[l.type];
      if (!C) return null;
      return <C key={l.id} config={l} masterIntensity={masterIntensity} />;
    });
}
```

- [ ] **Step 2: Write Fresnel.jsx**

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight } from '@react-three/drei';

export default function Fresnel({ config, masterIntensity }) {
  const lightRef = useRef();
  return (
    <SpotLight
      ref={lightRef}
      position={[config.position.x, config.position.y, config.position.z]}
      angle={(config.beamAngle * Math.PI) / 180}
      penumbra={config.softness}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={15}
      castShadow
      shadow-bias={-0.001}
    />
  );
}
```

- [ ] **Step 3: Write MovingHead.jsx**

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight } from '@react-three/drei';

export default function MovingHead({ config, masterIntensity }) {
  const lightRef = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta * config.speed;
    const x = Math.sin(t.current * 1.3) * 2;
    const y = Math.cos(t.current * 0.7) * 1.5;
    if (lightRef.current) {
      lightRef.current.position.set(
        config.position.x + x,
        config.position.y + y,
        config.position.z
      );
    }
  });

  return (
    <SpotLight
      ref={lightRef}
      position={[config.position.x, config.position.y, config.position.z]}
      angle={(config.beamAngle ?? 30) * (Math.PI / 180)}
      penumbra={config.softness ?? 0.3}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={15}
      castShadow
      shadow-bias={-0.001}
    />
  );
}
```

- [ ] **Step 4: Write Gobo.jsx**

```jsx
import { useMemo } from 'react';
import { SpotLight } from '@react-three/drei';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

function generateGoboTexture(pattern) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';

  const cx = size / 2;
  const cy = size / 2;

  switch (pattern) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i === 0 ? size * 0.35 : size * 0.35;
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'grid': {
      const step = size / 8;
      for (let x = 0; x < size; x += step)
        for (let y = 0; y < size; y += step) {
          ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
        }
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.35);
      ctx.lineTo(cx + size * 0.35, cy);
      ctx.lineTo(cx, cy + size * 0.35);
      ctx.lineTo(cx - size * 0.35, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'cross': {
      ctx.fillRect(cx - size * 0.05, cy - size * 0.35, size * 0.1, size * 0.7);
      ctx.fillRect(cx - size * 0.35, cy - size * 0.05, size * 0.7, size * 0.1);
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export default function Gobo({ config, masterIntensity }) {
  const texture = useMemo(
    () => generateGoboTexture(config.goboPattern),
    [config.goboPattern]
  );

  return (
    <spotLight
      position={[config.position.x, config.position.y, config.position.z]}
      angle={(config.beamAngle ?? 30) * (Math.PI / 180)}
      penumbra={config.softness ?? 0.3}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={15}
      castShadow
      shadow-bias={-0.001}
      map={texture}
    />
  );
}
```

Wait — `spotLight` in drei uses `map` differently. The Three.js SpotLight has a `map` property for gobo. Using the native `spotLight` element is correct here since drei's `<SpotLight>` is a soft wrapper that doesn't support map natively.

- [ ] **Step 5: Write Diffusore.jsx**

```jsx
export default function Diffusore({ config, masterIntensity }) {
  return (
    <pointLight
      position={[config.position.x, config.position.y, config.position.z]}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={10 + config.spread * 2}
      decay={1.5}
      castShadow
      shadow-bias={-0.005}
    />
  );
}
```

- [ ] **Step 6: Write Strobo.jsx**

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Strobo({ config, masterIntensity }) {
  const lightRef = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (lightRef.current) {
      const phase = Math.sin(t.current * config.frequency * Math.PI * 2);
      lightRef.current.intensity = phase > 0
        ? config.intensity * masterIntensity
        : 0;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[config.position.x, config.position.y, config.position.z]}
      color={config.color}
      distance={12}
      castShadow
      shadow-bias={-0.005}
    />
  );
}
```

- [ ] **Step 7: Verify no errors**

Run: `npm run dev`
Expected: scene loads, no errors

- [ ] **Step 8: Commit**

```bash
git add src/lights/
git commit -m "feat: add 5 light types and LightsRenderer"
```

---

### Task 6: Gobo pattern utility unit tests

**Files:**
- Create: `src/utils/goboPatterns.js`
- Create: `src/utils/goboPatterns.test.js`

- [ ] **Step 1: Extract goboPatterns utility**

```js
import * as THREE from 'three';

export function generateGoboTexture(pattern) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';

  const cx = size / 2;
  const cy = size / 2;

  switch (pattern) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size * 0.35 : size * 0.15;
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'grid': {
      const step = size / 8;
      for (let x = 0; x < size; x += step) {
        for (let y = 0; y < size; y += step) {
          ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
        }
      }
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.35);
      ctx.lineTo(cx + size * 0.35, cy);
      ctx.lineTo(cx, cy + size * 0.35);
      ctx.lineTo(cx - size * 0.35, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'cross': {
      const w = size * 0.08;
      const h = size * 0.35;
      ctx.fillRect(cx - w / 2, cy - h, w, h * 2);
      ctx.fillRect(cx - h, cy - w / 2, h * 2, w);
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
```

- [ ] **Step 2: Write goboPatterns test**

```js
import { describe, it, expect } from 'vitest';
import { generateGoboTexture } from './goboPatterns';

describe('generateGoboTexture', () => {
  it('returns a CanvasTexture for circle pattern', () => {
    const t = generateGoboTexture('circle');
    expect(t.image).toBeInstanceOf(HTMLCanvasElement);
    expect(t.image.width).toBe(256);
  });

  it('returns a CanvasTexture for all preset patterns', () => {
    for (const p of ['circle', 'star', 'grid', 'diamond', 'cross']) {
      const t = generateGoboTexture(p);
      expect(t.image).toBeInstanceOf(HTMLCanvasElement);
    }
  });

  it('falls back to circle for unknown pattern', () => {
    const t = generateGoboTexture('unknown');
    expect(t.image).toBeInstanceOf(HTMLCanvasElement);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 4: Update Gobo.jsx to use utility**

Replace inline `generateGoboTexture` in `src/lights/Gobo.jsx` with import from `../utils/goboPatterns`.

```jsx
import { useMemo } from 'react';
import { generateGoboTexture } from '../utils/goboPatterns';

export default function Gobo({ config, masterIntensity }) {
  const texture = useMemo(
    () => generateGoboTexture(config.goboPattern),
    [config.goboPattern]
  );

  return (
    <spotLight
      position={[config.position.x, config.position.y, config.position.z]}
      angle={(config.beamAngle ?? 30) * (Math.PI / 180)}
      penumbra={config.softness ?? 0.3}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={15}
      castShadow
      shadow-bias={-0.001}
      map={texture}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/ src/lights/Gobo.jsx
git commit -m "feat: extract gobo pattern utility with tests"
```

---

### Task 7: Control panel — MasterControl and LightChannel

**Files:**
- Create: `src/controls/MasterControl.jsx`
- Create: `src/controls/LightChannel.jsx`

- [ ] **Step 1: Write MasterControl.jsx**

```jsx
import { useStore } from '../store';

export default function MasterControl() {
  const word = useStore((s) => s.word);
  const masterIntensity = useStore((s) => s.masterIntensity);
  const setWord = useStore((s) => s.setWord);
  const setMasterIntensity = useStore((s) => s.setMasterIntensity);

  return (
    <div className="master-control">
      <h2 className="section-title">MASTER</h2>
      <label className="field">
        <span>Parola</span>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="text-input"
        />
      </label>
      <label className="field">
        <span>Intensità</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterIntensity}
          onChange={(e) => setMasterIntensity(Number(e.target.value))}
        />
        <span className="value">{Math.round(masterIntensity * 100)}%</span>
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Write LightChannel.jsx**

```jsx
import { useStore } from '../store';

const typeLabels = {
  fresnel: 'Fresnel',
  movinghead: 'Moving Head',
  gobo: 'Gobo',
  diffusore: 'Diffusore',
  strobo: 'Strobo',
};

const goboPatterns = ['circle', 'star', 'grid', 'diamond', 'cross'];

export default function LightChannel({ light }) {
  const toggleLight = useStore((s) => s.toggleLight);
  const removeLight = useStore((s) => s.removeLight);
  const updateLight = useStore((s) => s.updateLight);

  const set = (key, value) => updateLight(light.id, { [key]: value });

  return (
    <div className={`channel ${light.active ? 'active' : ''}`}>
      <div className="channel-header">
        <button
          className={`toggle ${light.active ? 'on' : 'off'}`}
          onClick={() => toggleLight(light.id)}
        >
          {light.active ? 'ON' : 'OFF'}
        </button>
        <span className="channel-type">{typeLabels[light.type]}</span>
        <button className="remove" onClick={() => removeLight(light.id)}>
          ✕
        </button>
      </div>

      <label className="field">
        <span>Colore</span>
        <input
          type="color"
          value={light.color}
          onChange={(e) => set('color', e.target.value)}
        />
      </label>

      <label className="field">
        <span>Intensità</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={light.intensity}
          onChange={(e) => set('intensity', Number(e.target.value))}
        />
        <span className="value">{Math.round(light.intensity * 100)}%</span>
      </label>

      <label className="field">
        <span>Pos X</span>
        <input
          type="range"
          min="-4"
          max="4"
          step="0.1"
          value={light.position.x}
          onChange={(e) =>
            set('position', { ...light.position, x: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>Pos Y</span>
        <input
          type="range"
          min="0.5"
          max="6"
          step="0.1"
          value={light.position.y}
          onChange={(e) =>
            set('position', { ...light.position, y: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>Pos Z</span>
        <input
          type="range"
          min="1"
          max="8"
          step="0.1"
          value={light.position.z}
          onChange={(e) =>
            set('position', { ...light.position, z: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>Beam Angle</span>
        <input
          type="range"
          min="10"
          max="80"
          step="1"
          value={light.beamAngle ?? 30}
          onChange={(e) => set('beamAngle', Number(e.target.value))}
        />
        <span className="value">{light.beamAngle ?? 30}°</span>
      </label>

      <label className="field">
        <span>Softness</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={light.softness ?? 0.3}
          onChange={(e) => set('softness', Number(e.target.value))}
        />
      </label>

      {light.type === 'movinghead' && (
        <label className="field">
          <span>Speed</span>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={light.speed}
            onChange={(e) => set('speed', Number(e.target.value))}
          />
        </label>
      )}

      {light.type === 'gobo' && (
        <>
          <label className="field">
            <span>Pattern</span>
            <select
              value={light.goboPattern}
              onChange={(e) => set('goboPattern', e.target.value)}
            >
              {goboPatterns.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Rotazione</span>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={light.goboRotation}
              onChange={(e) => set('goboRotation', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Scala</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={light.goboScale}
              onChange={(e) => set('goboScale', Number(e.target.value))}
            />
          </label>
        </>
      )}

      {light.type === 'strobo' && (
        <label className="field">
          <span>Frequenza</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={light.frequency}
            onChange={(e) => set('frequency', Number(e.target.value))}
          />
          <span className="value">{light.frequency} Hz</span>
        </label>
      )}

      {light.type === 'diffusore' && (
        <label className="field">
          <span>Spread</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={light.spread}
            onChange={(e) => set('spread', Number(e.target.value))}
          />
        </label>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/controls/MasterControl.jsx src/controls/LightChannel.jsx
git commit -m "feat: add MasterControl and LightChannel components"
```

---

### Task 8: MixerPanel — compose channels with add-light button

**Files:**
- Create: `src/controls/MixerPanel.jsx`

- [ ] **Step 1: Write MixerPanel.jsx**

```jsx
import { useState } from 'react';
import { useStore } from '../store';
import MasterControl from './MasterControl';
import LightChannel from './LightChannel';

const lightTypes = [
  { value: 'fresnel', label: 'Fresnel' },
  { value: 'movinghead', label: 'Moving Head' },
  { value: 'gobo', label: 'Gobo' },
  { value: 'diffusore', label: 'Diffusore' },
  { value: 'strobo', label: 'Strobo' },
];

export default function MixerPanel() {
  const lights = useStore((s) => s.lights);
  const addLight = useStore((s) => s.addLight);
  const [toast, setToast] = useState(null);

  const handleAdd = (type) => {
    if (lights.length >= 3) {
      setToast('Limite massimo 3 luci raggiunto. Disattivane una prima di aggiungerne un\'altra.');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    addLight(type);
  };

  return (
    <div>
      <h2 className="panel-title">🎛️ REGIA LUCI</h2>
      <MasterControl />

      <h3 className="section-title">CANALI</h3>
      {lights.map((l) => (
        <LightChannel key={l.id} light={l} />
      ))}

      <div className="add-light-bar">
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) handleAdd(e.target.value);
            e.target.value = '';
          }}
        >
          <option value="" disabled>
            + Aggiungi luce
          </option>
          {lightTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Add CSS for controls**

Add to `src/App.css`:

```css
.panel-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 16px;
  color: #888;
}

.section-title {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 16px 0 8px;
  color: #555;
}

.field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #aaa;
}

.field span:first-child {
  width: 70px;
  flex-shrink: 0;
}

.field input[type="range"] {
  flex: 1;
  height: 4px;
  accent-color: #ffd700;
}

.field input[type="color"] {
  width: 32px;
  height: 24px;
  padding: 0;
  border: 1px solid #333;
  background: none;
  cursor: pointer;
}

.field select {
  flex: 1;
  background: #1e1e1e;
  color: #e0e0e0;
  border: 1px solid #333;
  padding: 4px 8px;
  font-size: 12px;
}

.text-input {
  flex: 1;
  background: #1e1e1e;
  color: #e0e0e0;
  border: 1px solid #333;
  padding: 6px 10px;
  font-size: 16px;
  font-family: inherit;
}

.value {
  width: 40px;
  text-align: right;
  font-size: 11px;
  color: #666;
}

.channel {
  background: #1a1a1a;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 8px;
}

.channel.active {
  border-color: #ffd700;
}

.channel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.toggle {
  padding: 2px 10px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  background: none;
}

.toggle.on {
  color: #ffd700;
  border-color: #ffd700;
}

.toggle.off {
  color: #555;
  border-color: #333;
}

.channel-type {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #ccc;
}

.remove {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
}

.remove:hover {
  color: #ff4444;
}

.add-light-bar {
  margin-top: 12px;
}

.add-light-bar select {
  width: 100%;
  background: #1e1e1e;
  color: #e0e0e0;
  border: 1px dashed #444;
  padding: 8px;
  font-size: 13px;
  cursor: pointer;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff4444;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 100;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/controls/MixerPanel.jsx src/App.css
git commit -m "feat: add MixerPanel with add-light and toast"
```

---

### Task 9: GoboUploader — custom SVG upload

**Files:**
- Create: `src/controls/GoboUploader.jsx`

- [ ] **Step 1: Write GoboUploader.jsx**

```jsx
import { useRef } from 'react';
import { useStore } from '../store';

export default function GoboUploader({ lightId }) {
  const inputRef = useRef();
  const updateLight = useStore((s) => s.updateLight);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      updateLight(lightId, {
        goboPattern: 'custom',
        goboSVG: ev.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="field">
      <span>Carica SVG</span>
      <input
        ref={inputRef}
        type="file"
        accept=".svg"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <button
        className="upload-btn"
        onClick={() => inputRef.current?.click()}
      >
        Scegli file
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Add upload button CSS to App.css**

```css
.upload-btn {
  background: #1e1e1e;
  color: #ccc;
  border: 1px solid #333;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
}

.upload-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
}
```

- [ ] **Step 3: Wire GoboUploader into LightChannel**

In `LightChannel.jsx`, add import and render after the gobo controls:

```jsx
import GoboUploader from './GoboUploader';
// ...
{light.type === 'gobo' && (
  <>
    {/* ... existing gobo controls ... */}
    <GoboUploader lightId={light.id} />
  </>
)}
```

- [ ] **Step 4: Update Gobo.jsx to use custom SVG**

Modify `src/lights/Gobo.jsx`:

```jsx
import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { generateGoboTexture } from '../utils/goboPatterns';

export default function Gobo({ config, masterIntensity }) {
  const [svgTexture, setSvgTexture] = useState(null);

  useEffect(() => {
    if (config.goboPattern !== 'custom' || !config.goboSVG) {
      setSvgTexture(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 256, 256);
      ctx.drawImage(img, 0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      setSvgTexture(tex);
    };
    img.src = config.goboSVG;
  }, [config.goboSVG, config.goboPattern]);

  const presetTexture = useMemo(
    () =>
      config.goboPattern !== 'custom' ? generateGoboTexture(config.goboPattern) : null,
    [config.goboPattern]
  );

  const texture = config.goboPattern === 'custom' ? svgTexture : presetTexture;

  return (
    <spotLight
      position={[config.position.x, config.position.y, config.position.z]}
      angle={(config.beamAngle ?? 30) * (Math.PI / 180)}
      penumbra={config.softness ?? 0.3}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={15}
      castShadow
      shadow-bias={-0.001}
      map={texture}
    />
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/controls/GoboUploader.jsx src/lights/Gobo.jsx src/App.css
git commit -m "feat: add GoboUploader and custom SVG support"
```

---

### Task 10: Polish — text geometry, shadow quality, final integration

**Files:**
- Modify: `src/TextMesh.jsx`
- Modify: `src/Scene3D.jsx`

- [ ] **Step 1: Upgrade TextMesh to use drei Text component**

```jsx
import { Text } from '@react-three/drei';
import { useStore } from '../store';

export default function TextMesh() {
  const word = useStore((s) => s.word);

  return (
    <group position={[0, 0.2, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.8}
        font={undefined}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        castShadow
      >
        {word}
      </Text>
    </group>
  );
}
```

- [ ] **Step 2: Improve scene shadows in Scene3D**

```jsx
<Canvas
  shadows
  camera={{ position: [0, 2, 6], fov: 50 }}
  gl={{ toneMapping: 3, toneMappingExposure: 1 }}
  shadowMap={{ type: 1 }} // PCFsoft
>
```

- [ ] **Step 3: Run dev and verify full app**

Run: `npm run dev`
Expected: Full app loads — type a word, add lights, toggle them, adjust sliders, see 3D scene update in real time. Adding a 4th light shows toast.

- [ ] **Step 4: Run final test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/TextMesh.jsx src/Scene3D.jsx
git commit -m "feat: upgrade text mesh, improve shadows, final integration"
```

---

## Self-Review Checklist

After writing, verify against spec:

- [ ] **Spec coverage:** store (Task 2), scene/stage/text (Task 4), 5 light types (Task 5), gobo patterns + SVG (Task 6, 9), control panel (Task 7, 8), max 3 lights + toast (Task 2, 8)
- [ ] **Placeholder scan:** No TBD, TODO, "implement later", or vague steps. Every step has complete code.
- [ ] **Type consistency:** `config.position.x/y/z`, `config.intensity`, `config.color` used consistently across store and light components. `goboPattern`, `goboSVG`, `goboRotation`, `goboScale`, `frequency`, `spread` consistent with store interface.
