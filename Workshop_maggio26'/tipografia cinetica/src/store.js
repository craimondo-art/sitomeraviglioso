import { create } from 'zustand';

let nextId = 1;

const defaultParams = {
  fresnel: { beamAngle: 45, softness: 0.5 },
  movinghead: { beamAngle: 30, softness: 0.3, speed: 2 },
  gobo: { beamAngle: 30, softness: 0.3, goboPattern: 'circle', goboRotation: 0, goboScale: 1 },
  diffusore: { spread: 5 },
  strobo: { frequency: 5, beamAngle: 30, softness: 0.3 },
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
    const lights = get().lights;
    const light = lights.find((l) => l.id === id);
    if (!light) return;
    const activeCount = lights.filter((l) => l.active && l.id !== id).length;
    const nextActive = !light.active;
    if (nextActive && activeCount >= 3) return { error: 'Limite massimo 3 luci raggiunto' };
    set({
      lights: lights.map((l) => (l.id === id ? { ...l, active: nextActive } : l)),
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
