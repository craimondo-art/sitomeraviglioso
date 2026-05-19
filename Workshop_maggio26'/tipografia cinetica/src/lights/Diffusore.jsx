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
