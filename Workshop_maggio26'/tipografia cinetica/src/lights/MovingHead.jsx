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
