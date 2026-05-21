# Guida di Stile (Style Guide) per l'Interfaccia del Portfolio

Questo documento definisce le specifiche di stile per il portfolio di Clarissa Raimondo. Le istruzioni sono strutturate in modo chiaro e formale per consentire un'interpretazione e un'applicazione precisa da parte di sistemi di Intelligenza Artificiale (IA) e tool di sviluppo automatizzati.

---

## 1. Tavolozza Colori (Color Palette)

Il sistema utilizza la seguente palette di colori. Le combinazioni di contrasto specificate sono vincolanti per garantire l'accessibilità e la leggibilità del testo.

### Colori Principali
- **Colore Primario (Brand Accent):** `#e82e89` (Magenta/Rosa scuro)
- **Colore Secondario (Accent Light):** `#ffabe5` (Rosa chiaro)
- **Sfondo / Testo Chiaro:** `#ffffff` (Bianco)
- **Testo Scuro / Dettagli:** `#000000` (Nero)

### Regole di Contrasto e Colore del Testo (Text Contrast Rules)
L'IA deve applicare tassativamente le seguenti regole di accoppiamento cromatico per i testi sopra i background colorati:
- Se lo sfondo è **`#e82e89`**, il colore del testo sovrapposto deve essere **`#ffffff`**.
- Se lo sfondo è **`#ffabe5`**, il colore del testo sovrapposto deve essere **`#000000`**.

---

## 2. Tipografia (Typography)

Il sistema tipografico si basa su un unico font con variazioni di dimensione (size) e peso (weight).

- **Famiglia di Font (Font Family):** `Roboto Condensed` (via Google Fonts)

### Scala Tipografica (Typography Scale)
I valori di dimensione sono espressi in `rem` (assumendo la radice standard `1rem = 16px`) e i pesi in valori numerici standard CSS.

| Tag / Elemento | Dimensione (Size) | Peso (Weight) | Descrizione / Uso |
| :--- | :--- | :--- | :--- |
| **H1** | `4.00 rem` (64px) | `800` (Extra Bold) | Nome "CLARISSA RAIMONDO", tutto maiuscolo (text-transform: uppercase) |
| **H2** | `3.00 rem` (48px) | `300` (Light) | Sottotitolo "Esplorazioni con LLM" |
| **H3** | `2.00 rem` (32px) | `300` (Light) | Titolo progetto nell'overlay del carosello |
| **Body** | `1.25 rem` (20px) | `300` (Light) | Testo marquee |
| **Caption / Tags** | `1.00 rem` (16px) | `300` (Light) | Tags progetto nell'overlay del carosello |
| **Bottone** | `1.00 rem` (16px) | `300` (Light) | Pulsanti "Torna alla Home" e frecce carosello |

---

## 3. Layout Portfolio

### Hero / Header
- **Stato iniziale:** full viewport (100vh), sfondo `#e82e89`, colore testo `#ffffff`
- **Stato collassato (dopo click):** altezza `140px`, fisso in alto (`position: fixed; top: 0`)
- **Padding:** 12px sopra e sotto
- **Gap tra H1 e H2:** 4px
- **Transizione:** `height 0.8s ease-out`, `justify-content 0.8s ease-out`
- **Cursore:** `pointer` su tutta l'area

### Galleria / Carosello
- **Posizione:** top `140px`, bottom `48px`, larghezza piena
- **Area navigazione:** 20% sinistra (precedente), 60% centro (apri progetto), 20% destra (successivo)
- **Transizione slide:** `transform 0.25s ease`
- **Auto-play:** 10s per slide, ping-pong (cambia direzione agli estremi)
- **Overlay slide:** gradient `linear-gradient(transparent, rgba(0,0,0,0.7))` in basso, padding 30px

### Indicatori (dots)
- **Dimensione:** 14px × 14px
- **Inattivo:** sfondo `#ffffff`, bordo `2px solid rgba(0,0,0,0.15)`
- **Attivo:** sfondo `#e82e89`, bordo `#e82e89`
- **Posizione:** bottom 16px, centrato (`left: 50%; transform: translateX(-50%)`)

### Marquee
- **Altezza:** 48px
- **Sfondo:** `#ffabe5`
- **Colore testo:** `#000000`
- **Animazione:** `translateX(100vw)` a `translateX(-100%)`, durata 12s, linear infinite

### Vista Progetto (iframe)
- **Overlay full-screen** copre tutto il viewport, z-index 200
- **Bottone "← Torna alla Home":** fisso in alto a sinistra (16px), stile primario
- **Iframe:** larghezza e altezza 100%, supporto camera e microfono

---

## 4. Componente Bottone (Button Component)

### Stati dei Bottoni (Button States)

1. **Stato Standard / Default:**
   - Sfondo: `#e82e89`
   - Colore testo: `#ffffff`
   - Font: `Roboto Condensed`, 1rem, 300 weight
   - `border-radius: 999px`
   - Padding: `10px 22px` (rettangolare) o `40px × 40px` (circolare per frecce)

2. **Stato Hover (`:hover`):**
   - `box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.40)`

3. **Stato Attivo (`:active`):**
   - Colore di sfondo: `#c6287b`

4. **Stato Disabilitato (`:disabled`):**
   - Colore di sfondo: `#e5c1d4`
   - Colore testo: `#ffffff`
   - `pointer-events: none`
   - `box-shadow: none`

### Bottoni Freccia Carosello
- **Dimensione:** 40px × 40px, circolare
- **Visibilità:** `opacity: 0` di default, `opacity: 1` all'hover della zona (transizione 0.25s)
- **Allineamento:** centrato verticalmente nella zona di navigazione

### Esempio di Codice CSS Logico per l'IA
```css
.btn-primary {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  background-color: #e82e89;
  color: #ffffff;
  border-radius: 999px;
  padding: 10px 22px;
  border: none;
  cursor: pointer;
  transition: box-shadow 0.2s ease, background-color 0.2s ease;
}

.btn-primary:hover {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.40);
}

.btn-primary:active {
  background-color: #c6287b;
}

.btn-primary:disabled {
  background-color: #e5c1d4;
  color: #ffffff;
  pointer-events: none;
  box-shadow: none;
}
```
