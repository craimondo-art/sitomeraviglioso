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
      shadowMap={{ type: 1 }}
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
