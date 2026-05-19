import { useState } from 'react';
import { useStore } from '../store';
import MasterControl from './MasterControl';
import LightChannel from './LightChannel';

const lightTypes = [
  { value: 'fresnel', label: 'Fresnel' },
  { value: 'movinghead', label: 'Moving Head' },
  { value: 'gobo', label: 'Gobo' },
  { value: 'diffusore', label: 'Diffusore' },
  { value: 'strobo', label: 'Strobo' },
];

export default function MixerPanel() {
  const lights = useStore((s) => s.lights);
  const addLight = useStore((s) => s.addLight);
  const [toast, setToast] = useState(null);

  const handleAdd = (type) => {
    if (lights.length >= 3) {
      setToast("Limite massimo 3 luci raggiunto. Disattivane una prima di aggiungerne un'altra.");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    addLight(type);
  };

  return (
    <div>
      <h2 className="panel-title">🎛 REGIA LUCI</h2>
      <MasterControl />

      <h3 className="section-title">CANALI</h3>
      {lights.map((l) => (
        <LightChannel key={l.id} light={l} />
      ))}

      <div className="add-light-bar">
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) handleAdd(e.target.value);
            e.target.value = '';
          }}
        >
          <option value="" disabled>
            + Aggiungi luce
          </option>
          {lightTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
