import { useStore } from '../store';
import GoboUploader from './GoboUploader';

const typeLabels = {
  fresnel: 'Fresnel',
  movinghead: 'Moving Head',
  gobo: 'Gobo',
  diffusore: 'Diffusore',
  strobo: 'Strobo',
};

const goboPatterns = ['circle', 'star', 'grid', 'diamond', 'cross'];

export default function LightChannel({ light }) {
  const toggleLight = useStore((s) => s.toggleLight);
  const removeLight = useStore((s) => s.removeLight);
  const updateLight = useStore((s) => s.updateLight);

  const set = (key, value) => updateLight(light.id, { [key]: value });

  return (
    <div className={`channel ${light.active ? 'active' : ''}`}>
      <div className="channel-header">
        <button
          className={`toggle ${light.active ? 'on' : 'off'}`}
          onClick={() => toggleLight(light.id)}
        >
          {light.active ? 'ON' : 'OFF'}
        </button>
        <span className="channel-type">{typeLabels[light.type]}</span>
        <button className="remove" onClick={() => removeLight(light.id)}>
          ✕
        </button>
      </div>

      <label className="field">
        <span>Colore</span>
        <input
          type="color"
          value={light.color}
          onChange={(e) => set('color', e.target.value)}
        />
      </label>

      <label className="field">
        <span>Intensità</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={light.intensity}
          onChange={(e) => set('intensity', Number(e.target.value))}
        />
        <span className="value">{Math.round(light.intensity * 100)}%</span>
      </label>

      <label className="field">
        <span>Pos X</span>
        <input
          type="range"
          min="-4"
          max="4"
          step="0.1"
          value={light.position.x}
          onChange={(e) =>
            set('position', { ...light.position, x: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>Pos Y</span>
        <input
          type="range"
          min="0.5"
          max="6"
          step="0.1"
          value={light.position.y}
          onChange={(e) =>
            set('position', { ...light.position, y: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>Pos Z</span>
        <input
          type="range"
          min="1"
          max="8"
          step="0.1"
          value={light.position.z}
          onChange={(e) =>
            set('position', { ...light.position, z: Number(e.target.value) })
          }
        />
      </label>

      <label className="field">
        <span>Beam Angle</span>
        <input
          type="range"
          min="10"
          max="80"
          step="1"
          value={light.beamAngle ?? 30}
          onChange={(e) => set('beamAngle', Number(e.target.value))}
        />
        <span className="value">{light.beamAngle ?? 30}°</span>
      </label>

      <label className="field">
        <span>Softness</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={light.softness ?? 0.3}
          onChange={(e) => set('softness', Number(e.target.value))}
        />
      </label>

      {light.type === 'movinghead' && (
        <label className="field">
          <span>Speed</span>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={light.speed}
            onChange={(e) => set('speed', Number(e.target.value))}
          />
        </label>
      )}

      {light.type === 'gobo' && (
        <>
          <label className="field">
            <span>Pattern</span>
            <select
              value={light.goboPattern}
              onChange={(e) => set('goboPattern', e.target.value)}
            >
              {goboPatterns.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Rotazione</span>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={light.goboRotation}
              onChange={(e) => set('goboRotation', Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Scala</span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={light.goboScale}
              onChange={(e) => set('goboScale', Number(e.target.value))}
            />
          </label>
          <GoboUploader lightId={light.id} />
        </>
      )}

      {light.type === 'strobo' && (
        <label className="field">
          <span>Frequenza</span>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={light.frequency}
            onChange={(e) => set('frequency', Number(e.target.value))}
          />
          <span className="value">{light.frequency} Hz</span>
        </label>
      )}

      {light.type === 'diffusore' && (
        <label className="field">
          <span>Spread</span>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={light.spread}
            onChange={(e) => set('spread', Number(e.target.value))}
          />
        </label>
      )}
    </div>
  );
}
