import { useRef } from 'react';
import { useStore } from '../store';

export default function GoboUploader({ lightId }) {
  const inputRef = useRef();
  const updateLight = useStore((s) => s.updateLight);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      updateLight(lightId, {
        goboPattern: 'custom',
        goboSVG: ev.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="field">
      <span>Carica SVG</span>
      <input
        ref={inputRef}
        type="file"
        accept=".svg"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <button
        className="upload-btn"
        onClick={() => inputRef.current?.click()}
      >
        Scegli file
      </button>
    </div>
  );
}
