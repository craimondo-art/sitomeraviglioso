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
