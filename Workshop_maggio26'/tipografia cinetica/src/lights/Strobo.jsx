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
