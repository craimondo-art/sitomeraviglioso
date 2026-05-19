import { SpotLight } from '@react-three/drei';

export default function Fresnel({ config, masterIntensity }) {
  return (
    <SpotLight
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
