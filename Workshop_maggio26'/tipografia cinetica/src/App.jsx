import Scene3D from './Scene3D';
import MixerPanel from './controls/MixerPanel';

export default function App() {
  return (
    <div className="app">
      <div className="scene-panel">
        <Scene3D />
      </div>
      <div className="mixer-panel">
        <MixerPanel />
      </div>
    </div>
  );
}
