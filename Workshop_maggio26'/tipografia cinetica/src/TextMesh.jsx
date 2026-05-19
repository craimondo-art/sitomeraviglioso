import { Text } from '@react-three/drei';
import { useStore } from './store';

export default function TextMesh() {
  const word = useStore((s) => s.word);

  return (
    <group position={[0, 0.2, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.8}
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
