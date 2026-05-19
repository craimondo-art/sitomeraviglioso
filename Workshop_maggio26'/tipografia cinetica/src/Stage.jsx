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
