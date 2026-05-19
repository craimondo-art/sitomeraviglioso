import * as THREE from 'three';

export function generateGoboTexture(pattern) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#fff';

  const cx = size / 2;
  const cy = size / 2;

  switch (pattern) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size * 0.35 : size * 0.15;
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'grid': {
      const step = size / 8;
      for (let x = 0; x < size; x += step) {
        for (let y = 0; y < size; y += step) {
          ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
        }
      }
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.35);
      ctx.lineTo(cx + size * 0.35, cy);
      ctx.lineTo(cx, cy + size * 0.35);
      ctx.lineTo(cx - size * 0.35, cy);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'cross': {
      const w = size * 0.08;
      const h = size * 0.35;
      ctx.fillRect(cx - w / 2, cy - h, w, h * 2);
      ctx.fillRect(cx - h, cy - w / 2, h * 2, w);
      break;
    }
    default:
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
