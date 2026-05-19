import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { generateGoboTexture } from '../utils/goboPatterns';

export default function Gobo({ config, masterIntensity }) {
  const [svgTexture, setSvgTexture] = useState(null);

  useEffect(() => {
    if (config.goboPattern !== 'custom' || !config.goboSVG) {
      setSvgTexture(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 256, 256);
      ctx.drawImage(img, 0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      setSvgTexture(tex);
    };
    img.src = config.goboSVG;
  }, [config.goboSVG, config.goboPattern]);

  const presetTexture = useMemo(
    () =>
      config.goboPattern !== 'custom' ? generateGoboTexture(config.goboPattern) : null,
    [config.goboPattern]
  );

  const texture = config.goboPattern === 'custom' ? svgTexture : presetTexture;

  return (
    <spotLight
      position={[config.position.x, config.position.y, config.position.z]}
      angle={(config.beamAngle ?? 30) * (Math.PI / 180)}
      penumbra={config.softness ?? 0.3}
      intensity={config.intensity * masterIntensity}
      color={config.color}
      distance={15}
      castShadow
      shadow-bias={-0.001}
      map={texture}
    />
  );
}
