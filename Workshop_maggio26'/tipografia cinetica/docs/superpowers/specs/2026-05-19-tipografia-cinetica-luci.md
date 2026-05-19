# Tipografia Cinetica — Pannello Luci da Palcoscenico

## Obiettivo

Web tool 3D per animare una parola con effetti di illuminazione teatrale.
La parola è un attore su un palcoscenico virtuale; l'utente la illumina
combinando fino a 3 tipi di luce simultanei, controllati da un pannello
di regia con slider e color picker.

## Tech Stack

- **Vite + React** — build e UI
- **@react-three/fiber** — scena 3D dichiarativa
- **@react-three/drei** — utility Three.js (Text, OrbitControls, useFont)
- **Zustand** — stato globale delle luci
- **Three.js** — rendering WebGL, ShadowMap

## Architettura

```
src/
├── App.jsx                 # Layout due colonne: scena + pannello
├── Scene3D.jsx             # Canvas R3F, scene setup, pavimento
├── TextMesh.jsx            # Parola 3D con TextGeometry
├── lights/                 # Componenti luce
│   ├── Fresnel.jsx         # SpotLight soft edge
│   ├── MovingHead.jsx      # SpotLight in movimento Lissajous
│   ├── Gobo.jsx            # SpotLight con texture maschera
│   ├── Diffusore.jsx       # PointLight morbida e ampia
│   └── Strobo.jsx          # Luci pulsanti a frequenza regolabile
├── controls/               # Pannello di regia
│   ├── MixerPanel.jsx      # Layout verticale del mixer
│   ├── LightChannel.jsx    # Singolo canale: toggle + parametri
│   ├── MasterControl.jsx   # Dimmer globale + input parola
│   └── GoboUploader.jsx    # Upload SVG per Gobo personalizzato
├── store.js                # Zustand store centrale
└── styles.css              # Layout e tema scuro palcoscenico
```

## Store (Zustand)

```ts
interface LightState {
  id: string;
  type: 'fresnel' | 'movinghead' | 'gobo' | 'diffusore' | 'strobo';
  active: boolean;
  color: string;
  intensity: number;
  position: { x: number; y: number; z: number };
  beamAngle: number;
  softness: number;
  speed: number;
  // Gobo-specific
  goboPattern: 'circle' | 'star' | 'grid' | 'diamond' | 'cross' | 'custom';
  goboSVG?: string;          // data URL dello SVG caricato
  goboRotation: number;
  goboScale: number;
  // Strobo-specific
  frequency: number;
  // Diffusore-specific
  spread: number;
}

interface Store {
  word: string;
  masterIntensity: number;
  lights: LightState[];
  maxLights: 3;
  addLight: (type: LightState['type']) => void;
  removeLight: (id: string) => void;
  toggleLight: (id: string) => void;
  updateLight: (id: string, partial: Partial<LightState>) => void;
  setWord: (word: string) => void;
  setMasterIntensity: (v: number) => void;
}
```

## Layout UI

Due colonne: scena 3D (~70%) a sinistra, pannello di regia (~30%) a destra.

### Pannello di regia

- **Input testo** — campo per scrivere la parola
- **Master Intensity** — slider dimmer globale (0-100%)
- **Lista luci attive** — ogni luce è un "canale" con:
  - Toggle ON/OFF
  - Color picker (colore del fascio)
  - Slider intensità specifica
  - Slider posizione X/Y/Z (grid 3x3)
  - Slider beam angle
  - Slider softness
  - Parametri specifici per tipo (speed, frequency, spread, gobo pattern)
- **Pulsante "Aggiungi luce"** — menu a tendina per scegliere il tipo
- **Avviso limite:** se l'utente tenta di attivare una 4ª luce, compare
  un toast/alert: "Limite massimo 3 luci raggiunto. Disattivane una prima
  di aggiungerne un'altra."

### Scena 3D

- Sfondo nero (palcoscenico)
- Pavimento semitrasparente che riceve le ombre (opacità regolabile)
- La parola fluttua al centro, leggermente sopra il pavimento
- OrbitControls per ruotare la visuale (opzionale: disattivabile)
- Ogni luce attiva si vede come un punto/cono luce nella scena

## Sistema Luci

### Fresnel
- SpotLight con decay morbido
- Beam angle: 10°–80°
- Softness controlla il penumbra (bordo sfumato)
- Ombra: sì

### Moving Head
- SpotLike con oscillazione automatica su traiettoria Lissajous
- Speed controlla la velocità di oscillazione
- Posizione base X/Y/Z regolabile
- Ombra: sì

### Gobo (Sagomatore)
- SpotLight con texture proiettata come maschera
- Preset: cerchio, stella, griglia, rombo, croce (generati via Canvas 2D)
- Carica SVG: l'utente uploada un file .svg; convertito in texture Three.js
  via Blob → Image → CanvasTexture
- Rotazione e scala del pattern regolabili
- Ombra: sì

### Diffusore
- PointLight con ampio spread
- Luce morbida, ombre morbide (bias alto)
- Spread controlla la distanza di decadimento

### Strobo
- PointLight o SpotLight che pulsa con onda quadra
- Frequenza: 1–20 Hz regolabile
- Ombra: sì (se attivo, le ombre pulsano con la luce)

## Limite Luci

Massimo **3 luci attive contemporaneamente**. Quando l'utente prova
ad attivarne una quarta, il toggle non si attiva e compare un avviso
visivo. L'utente deve disattivare una luce esistente per poterne
aggiungere un'altra.

## Ombre

- Three.js ShadowMap con PCFsoft
- Ogni luce attiva proietta ombra sul pavimento
- Opacità pavimento e qualità ombra regolabili
- Ombre colorate: il colore dell'ombra segue il colore della luce

## Gobo SVG

1. User seleziona file .svg via `<input type="file">`
2. Il tool carica l'SVG come Image (data URL)
3. Lo disegna su un Canvas 2D offscreen
4. Genera una `CanvasTexture` Three.js
5. La texture viene assegnata come `map` dello SpotLight

## Target

Singola pagina web (SPA). Nessun backend, nessun salvataggio persistente.
Tutto gira lato client.
