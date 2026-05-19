import { useStore } from '../store';

export default function MasterControl() {
  const word = useStore((s) => s.word);
  const masterIntensity = useStore((s) => s.masterIntensity);
  const setWord = useStore((s) => s.setWord);
  const setMasterIntensity = useStore((s) => s.setMasterIntensity);

  return (
    <div className="master-control">
      <h2 className="section-title">MASTER</h2>
      <label className="field">
        <span>Parola</span>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="text-input"
        />
      </label>
      <label className="field">
        <span>Intensità</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterIntensity}
          onChange={(e) => setMasterIntensity(Number(e.target.value))}
        />
        <span className="value">{Math.round(masterIntensity * 100)}%</span>
      </label>
    </div>
  );
}
