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
