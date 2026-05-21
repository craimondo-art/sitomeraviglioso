# Texture Viewer — Design Doc

## Scopo

Web tool singolo per visualizzare dinamicamente la texture SVG (`texture.svg`) ripetuta in pattern, con controlli in tempo reale su colore fill, colore stroke e scala.

## Architettura

Singola pagina HTML (`index.html`) con zero dipendenze esterne. Tutto il codice è inline (HTML + CSS + JS).

### Componenti

**Canvas principale** — copre l'intero viewport. Disegna la texture in tiling (ripetizione orizzontale e verticale) per riempire tutto lo schermo.

**Canvas offscreen (nascosto)** — renderizza la texture SVG una volta applicando fill e stroke correnti. Usato come sorgente per il tiling sul canvas principale.

**Pannello di controllo** — 3 bottoni bianchi flottanti, centrati orizzontalmente in basso, equidistanti, senza barra di sfondo.

### Controlli

1. **Fill** — rettangolo bianco che contiene la scritta "Fill" + un cerchio col colore corrente. Al click apre un `<input type="color">` nascosto. Cambia il colore di riempimento dei rettangoli della texture.
2. **Stroke** — stesso pattern, "Stroke" + cerchio colore. Cambia il colore del bordo.
3. **Scala** — rettangolo bianco che contiene uno slider `<input type="range">` (min: 0.25, max: 3, step: 0.1) + etichetta col valore corrente. Controlla il fattore di scala della texture.

### Stile bottoni

- Sfondo: bianco (`#fff`)
- Bordo: nessuno (o a piacere)
- `border-radius: 60px`
- `box-shadow: rgba(0,0,0,0.2)` — ombra nera al 20%
- Equidistanti, centrati orizzontalmente, allineati in basso

## Flusso dati

```
Stato: { fill: '#ffffff', stroke: '#1d1d1b', scale: 1 }
  │
  ├─ input cambia fill → aggiorna stato.fill → ricalcola cerchio → render
  ├─ input cambia stroke → aggiorna stato.stroke → ricalcola cerchio → render
  └─ slider cambia scale → aggiorna stato.scale → render

render():
  1. Parsa SVG, applica fill/stroke alle rect
  2. Renderizza SVG su canvas offscreen
  3. Ciclo for su canvas principale: drawImage in tiling con scala
```

## Layout

```
┌──────────────────────────────────┐
│                                  │
│       Canvas (tiling)            │
│       riempie tutto              │
│                                  │
│                                  │
│   ┌────────┐ ┌────────┐ ┌─────┐ │
│   │  Fill  │ │ Stroke │ │ 1.0 │ │
│   │  (●)   │ │  (●)   │ │ ═══ │ │
│   └────────┘ └────────┘ └─────┘ │
└──────────────────────────────────┘
```

## Casi d'uso

- Aprire la pagina → texture visualizzata con colori e scala di default
- Cambiare fill → texture si aggiorna in tempo reale
- Cambiare stroke → texture si aggiorna in tempo reale
- Muovere slider scala → texture si ridimensiona in tempo reale

## Non incluso (YAGNI)

- Download / export immagine
- Upload texture personalizzata
- Animazioni / transizioni
- Responsive oltre al viewport pieno

## Implementazione

- Un file: `index.html` salvato in `Workshop_maggio26'/texture/`
- SVG embedded direttamente come stringa template nel JS (per evitare CORS su file://)
- Parsing SVG via DOMParser per applicare fill/stroke prima di renderizzare su canvas offscreen
