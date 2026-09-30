# WUNDERKAMMER — Specifica Tecnica & Architetturale
**Progetto:** Wunderkammer (Cabinet de Curiosités — Arte & Algoritmi)  
**Target:** Web application client-side multi-pagina  
**Hosting:** GitHub Pages via GitHub Actions CI/CD  
**Stack Core:** Vite, Vanilla TypeScript / JavaScript (ES Modules), Three.js, WebGL 2, Web Audio API, Canvas 2D  

---

## 1. Visione del Progetto & Vincoli

Wunderkammer è una piattaforma web interattiva a zero backend (100% static client-side) concepita come una "Camera delle Meraviglie" digitale. Collega la storia dell'arte con la fisica ottica, le neuroscienze computazionali della visione e la computer graphics.

### Vincoli Ingegneristici Imperativi
1. **Serverless & Zero-Cost:** Tutto deve girare sul browser del client. Nessun container o server Node attivo a runtime.
2. **Prestazioni Real-Time:** Simulazioni fisiche, automi cellulari e rendering 3D devono mantenere un frame-rate target di **60 FPS** su macchine client medie (GPU integrata inclusa).
3. **Isolamento Modulare:** La Home funge da hub di smistamento. Ognuna delle 6 stanze è un'applicazione autonoma situata nella propria cartella (`modules/XX-nome`), con il proprio ciclo vitale, canvas e controlli dedicati.
4. **Resilienza Asset:** Dipinti e texture devono essere caricati da manifest locali (formato WebP compresso) con fallback su API museali aperte (CORS-enabled).

---

## 2. Struttura del Repository & Build System

```text
wunderkammer/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Pipeline CI/CD GitHub Pages
├── public/
│   ├── assets/
│   │   ├── paintings/              # Dipinti pre-campionati in formato compresso
│   │   └── textures/               # Mappe di rugosità, craquelure e fibre di lino
│   └── favicon.svg
├── modules/
│   ├── 01-pigmenti/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── pigment-engine.js       # Modello Kubelka-Munk e aging matrix
│   │   └── main.js
│   ├── 02-gestalt/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── sobel-gradient.js       # Kernel di convoluzione per vettori di forza
│   │   ├── scanpath-sim.js         # Motore stocastico di salienza e IoR
│   │   └── main.js
│   ├── 03-morfogenesi/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── shaders/                # Fragment & Vertex shaders (Gray-Scott)
│   │   │   ├── gray-scott.frag.js
│   │   │   └── render.frag.js
│   │   ├── fbo-pingpong.js         # Gestione framebuffers WebGL2
│   │   └── main.js
│   ├── 04-restauro/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── scene-manager.js        # Configurazione Three.js & PointLight
│   │   ├── material-pipeline.js    # Normal map da luminanza & UV/X-Ray shaders
│   │   └── main.js
│   ├── 05-frequenza/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── fft2d.js                # Trasformata di Fourier 2D per matrici spaziali
│   │   ├── audio-synth.js          # Web Audio API harmonic drone generator
│   │   └── main.js
│   └── 06-chimera/
│       ├── index.html
│       ├── style.css
│       ├── met-api-client.js       # Client con cache per collectionapi.metmuseum.org
│       ├── image-slicer.js         # Maschere e compositing procedurale Canvas
│       └── main.js
├── src/
│   ├── shared/
│   │   ├── ui-kit.css              # Design system condiviso (dark/museale)
│   │   ├── navigation.js           # Back-to-hub, breadcrumb, loader
│   │   └── math-utils.js           # Clamping, lerp, convoluzioni comuni
│   ├── main.js                     # Logica atmosfera della Home
│   └── style.css                   # Stili della Home Page
├── index.html                      # Entry point Home Page
├── package.json
└── vite.config.js
```

### Configurazione `vite.config.js` (Multi-Page App)

```javascript
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Cruciale per il sub-path su GitHub Pages (username.github.io/wunderkammer/)
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pigmenti: resolve(__dirname, 'modules/01-pigmenti/index.html'),
        gestalt: resolve(__dirname, 'modules/02-gestalt/index.html'),
        morfogenesi: resolve(__dirname, 'modules/03-morfogenesi/index.html'),
        restauro: resolve(__dirname, 'modules/04-restauro/index.html'),
        frequenza: resolve(__dirname, 'modules/05-frequenza/index.html'),
        chimera: resolve(__dirname, 'modules/06-chimera/index.html'),
        quadro: resolve(__dirname, 'modules/07-quadro-del-giorno/index.html'),
      },
    },
  },
});
```

---

## 3. Specifiche Tecniche Dettagliate delle Stanze

### Stanza 01: L'Atelier dei Pigmenti Perduti
- **Dominio:** Chimica e Ottica dei Mezzi Torbidi.
- **Obiettivo:** Modellare l'interazione sottrattiva reale dei pigmenti d'epoca (non il semplice blending RGB $(A+B)/2$) e visualizzare la reattività temporale a fattori ambientali (luce solare, ossidazione, leganti degradati).

#### 1. Modello di Mixing (Kubelka-Munk Approssimato)
Ogni pigmento è definito da una coppia di parametri spettrali $K$ (assorbimento) e $S$ (diffusione) su canali discreti ($R, G, B$):

$$\frac{K_{\text{mix}}}{S_{\text{mix}}} = \frac{\sum c_i K_i}{\sum c_i S_i}$$

Riflettanza monocromatica della miscela su strato opaco:

$$R_\infty = 1 + \frac{K}{S} - \sqrt{\left(\frac{K}{S}\right)^2 + 2\left(\frac{K}{S}\right)}$$

#### 2. Matrice Pigmenti Storici
- **Verde di Schweinfurt (Arsenico):** Elevata brillantezza iniziale, vira a tonalità cupe solforate con fumi d'olio.
- **Giallo Indiano (Urina bovina da mango):** Trasparente, calda luminosità, vulnerabile a radiazione UV.
- **Blu Oltremare (Lazurite / Lapislazzuli):** Indistruttibile alla luce, suscettibile alla "malattia dell'oltremare" (decolorazione per ambiente acido).
- **Nero di Mummia (Bitume organico):** Asciuga male, tende a raggrinzire e formare crepe irreversibili (*alligatoring*).
- **Biacca di Piombo:** Elevato potere coprente, ingiallisce al buio per formazione di solfuro di piombo ($PbS$), schiarisce alla luce.
- **Cinabro ($HgS$):** Fotodegradazione da rosso vivo a nero/grigio (trasformazione metastabile in metacinabro).

#### 3. Interfaccia e Controlli
- **Canvas di impasto:** disegno continuo con pennello a densità regolabile.
- **Slider Temporale:** 0 anni $\rightarrow$ 500 anni.
- **Modificatori Ambientali:** esposizione UV (slider), umidità (slider).
- **Shader / Filtro Canvas:** matrice di trasformazione colore e sovrapposizione procedurale di crepe (Noise di Voronoi).

---

### Stanza 02: La Geometria Invisibile & Campi di Forza della Gestalt
- **Dominio:** Psicofisica della Visione & Analisi Tensoriale dell'Immagine.
- **Obiettivo:** Estrarre le direttrici di forza compositiva e simulare la traiettoria saccadica dell'occhio umano nei primi 5 secondi di osservazione (Rudolf Arnheim + Modello di Salienza di Itti-Koch).

#### 1. Algoritmo di Estrazione dei Gradienti
Conversione dell'opera in mappa di luminanza:

$$Y = 0.299R + 0.587G + 0.114B$$

Convoluzione con kernel di Sobel / Scharr ($3 \times 3$) per ricavare i gradienti parziali $\nabla I = (G_x, G_y)$:

$$G_x = \begin{bmatrix} -3 & 0 & +3 \\ -10 & 0 & +10 \\ -3 & 0 & +3 \end{bmatrix} * I, \quad G_y = \begin{bmatrix} -3 & -10 & -3 \\ 0 & 0 & 0 \\ +3 & +10 & +3 \end{bmatrix} * I$$

Magnitudo e orientazione del campo vettoriale:

$$\theta(x,y) = \arctan2(G_y, G_x) + \frac{\pi}{2} \quad (\text{lungo le isolinee compositive})$$

#### 2. Simulatore di Scanpath (Movimento Saccadico)
- **Salienza Computata:** Combinazione lineare di mappe piramidali di contrasto di luminanza, orientazione dei bordi e contrasto cromatico opponente (rosso-verde, blu-giallo).
- **Meccanismo Winner-Take-All (WTA):** Individua il massimo di salienza globale.
- **Inhibition of Return (IoR):** Ogni punto fissato genera un campo inibitorio gaussiano a decadimento temporale nel raggio circostante, costringendo l'occhio al salto saccadico successivo.
- **Resa Visiva:** Particella luminosa che lascia una scia fluida con cerchi di fissazione (raggio proporzionale alla durata della sosta visiva).

---

### Stanza 03: Morfogenesi su Tela (Reazione-Diffusione)
- **Dominio:** Automi Cellulari Continui & Biologia Teorica.
- **Obiettivo:** Trasformare un'opera in un substrato chimico virtuale governato dal sistema di Gray-Scott a 60 FPS via WebGL 2.

#### 1. Sistema Dinamico di Gray-Scott

$$\frac{\partial U}{\partial t} = D_u \nabla^2 U - UV^2 + F(1-U)$$

$$\frac{\partial V}{\partial t} = D_v \nabla^2 V + UV^2 - (F + k)V$$

- $U$: sostanza chimica "nutriente", $V$: "reagente".
- $D_u = 0.2097$, $D_v = 0.105$ (coefficienti di diffusione).
- **Parametri $F$ (feed rate) e $k$ (kill rate) determinano i pattern:**
  - **Solitoni / Punti isolati:** $F=0.030, k=0.062$
  - **Spirali di Turing:** $F=0.018, k=0.051$
  - **Coralli / Reti ramificate:** $F=0.0545, k=0.062$
  - **Caos / Onde instabili:** $F=0.026, k=0.055$

#### 2. Architettura WebGL 2 Ping-Pong FBO
- Due Texture a 32-bit floating point (`RGBA32F` o fallback `RGBA8`).
- **Pass 1:** Fragment shader computa il Laplaciano $\nabla^2$ via stencil 9-point e integra il passaggio $\Delta t$.
- **Pass 2:** Shader di rendering mappa le concentrazioni di $V$ interpolando la palette cromatica originaria dell'opera campionata.
- **Interattività:** Mouse drag inietta perturbazioni locali di concentrazione $V$.

---

### Stanza 04: Luce Radente & Tavolo del Restauratore 3D
- **Dominio:** Micro-topografia, Spettroscopia e Indagini Diagnostiche non Invasive.
- **Obiettivo:** Visualizzare in 3D la materia pittorica (impasto, pennellate dense, solchi e craquelure) usando Three.js e lampade mobili a raggio radente, con switch multispettrale (Visibile, Raggi X, UV).

#### 1. Pipeline di Geometria e Materiali (Three.js)
- **Mesh:** `PlaneGeometry(width, height, 512, 512)`.
- **Displacement / Height Map:** Derivata combinando:
  - Grayscale ad alto contrasto della cromia (la materia bianca/chiara ha spessore maggiore nella pittura classica).
  - Layer di Perlin noise ad altissima frequenza (trama della tela di canapa o lino).
  - Texture di frattura Voronoi per i solchi del craquelure.
- **Normal Map:** Calcolata analiticamente dallo height map per produrre ombreggiatura micro-scalare ad alta fedeltà.

#### 2. Illuminazione Radente Dinamica
- `PointLight` a quota z estremamente bassa ($z \approx 0.05 \cdot \text{width}$) posizionata dinamicamente in base alle coordinate del cursore.
- Angoli di incidenza bassi generano ombre proiettate orizzontalmente (*cast shadows* sulle creste della pittura), evidenziando la plasticità della mano dell'artista.

#### 3. Modalità Spettrali (Multi-Layer Shader)
- **Canale Visibile:** Mappa colore standard in luce radente.
- **Canale Raggi X:** Cross-fade verso radiografia grayscale del dipinto, rivelando telaio sottostante, chiodi arrugginiti e pentimenti (figure abbozzate e cancellate).
- **Canale UV (Luce di Wood):** Shader che amplifica le tonalità verde fluorescente (vernici antiche a resina dammar) e visualizza macchie nere spente nei punti di ritocco moderno/restauro postumo.

---

### Stanza 05: La Frequenza dell'Arte (FFT 2D & Sinestesia Acustica)
- **Dominio:** Elaborazione di Segnali Bidimensionali & Sintesi Sonora Armonica.
- **Obiettivo:** Calcolare la trasformata di Fourier spaziale bidimensionale del dipinto, consentire filtraggi selettivi (passa-alto / passa-basso) e sonificare lo spettro di potenza con la Web Audio API.

#### 1. Trasformata di Fourier 2D (FFT 2D)
Data l'immagine $f(x, y)$ di dimensione $N \times N$:

$$F(u, v) = \sum_{x=0}^{N-1} \sum_{y=0}^{N-1} f(x, y) e^{-j 2\pi \left(\frac{ux}{N} + \frac{vy}{N}\right)}$$

Visualizzazione dello Spettro di Potenza con scala logaritmica e shift delle frequenze zero al centro:

$$S(u, v) = \log\left(1 + \sqrt{\text{Re}(F)^2 + \text{Im}(F)^2}\right)$$

- **Filtro Passa-Basso:** Rimuove i dettagli minuti, lasciando solo le masse plastiche e le armonie di volume.
- **Filtro Passa-Alto:** Estrae il solo disegno dei bordi, cancellando la tonalità complessiva.

#### 2. Motore Audio (Web Audio API)
- Spettrogramma suddiviso in 8 corone circolari concentriche (bande di frequenza spaziale radiale $r = \sqrt{u^2 + v^2}$).
- Le basse frequenze ($r \to 0$) pilotano oscillatori sinusoidali sub-bass (droni gravi a 55 Hz - 110 Hz).
- Le medie frequenze pilotano accordi modali (quinte giuste, ottave).
- Le alte frequenze (dettagli netti, rumore, spatolature caotiche) alimentano generatori di rumore filtrato a banda stretta e riverberi a convoluzione.
- **Confronto acustico diretto:** la compostezza geometrica di Piero della Francesca genera accordi stabili e limpidi; l'action painting di Jackson Pollock genera masse sonore caotiche e frequenze sature.

---

### Stanza 06: Il Chimera Museum (Cadavre Exquis con API Museali)
- **Dominio:** Compositing Generativo Procedurale & Open Cultural Data.
- **Obiettivo:** Interrogare dinamicamente le collezioni ad accesso aperto (Public Domain / CC0) del Metropolitan Museum of Art di New York, segmentando e ricomponendo frammenti di opere eterogenee in un collage surrealista continuo.

#### 1. Pipeline di Chiamata API Met Museum
- **Endpoint Primario:**
  ```http
  GET https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&isPublicDomain=true&q={tag}
  ```
- **Tag controllati:** `sky`, `portrait`, `hands`, `costume`, `landscape`, `beast`.
- **Fetch dettagli reperto:**
  ```http
  GET https://collectionapi.metmuseum.org/public/collection/v1/objects/{objectID}
  ```
- Recupero di `primaryImageSmall` (risoluzione bilanciata per download e manipolazione immediata).

#### 2. Segmentazione e Composizione su Canvas
- **Suddivisione a zone anatomiche / spaziali:**
  - **Fascia Superiore (0 - 25% altezza):** Atmosfere, cieli dorati bizantini, volte barocche.
  - **Fascia Centrale (20 - 75% altezza):** Busti rinascimentali, armature, volti fiamminghi.
  - **Fascia Inferiore (70 - 100% altezza):** Drappeggi, pavimenti prospettici, bestiari medievali.
- **Raccordo a gradiente alfa (feathering):** per fondere i bordi dei ritagli senza saldature nette.
- **Armonizzazione Cromatica:** applicazione di un color overlay unificante in modalità multiply o soft-light.
- **Cartellino Museale Dinamico:** Generazione automatica della legenda d'archivio che elenca titolo, autore, datazione e link al reperto originale di ogni pezzo della chimera.

---

## 4. Design System & Direttive Visive Shared

Per garantire l'atmosfera di archivio storico-scientifico, ogni pagina deve aderire rigorosamente a questi token visivi:

```css
:root {
  --bg-void: #090a0c;
  --bg-panel: #131519;
  --border-subtle: #242831;
  --gold-primary: #d4af37;
  --gold-dim: #7f6820;
  --cyan-diagnostic: #00e5ff;
  --text-main: #f0f2f5;
  --text-muted: #7e8694;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-title: 'Cinzel', serif;
  --font-mono: 'Space Mono', monospace;
}
```

### Regole di Layout per le Singole Stanze
- **Header Minimo Obbligatorio:** In alto a sinistra link `← Torna all'Archivio`, al centro titolo della stanza in `font-title`, a destra indicatore FPS / Status runtime in `font-mono`.
- **Main Workspace:** Canvas o viewport WebGL a tutto schermo o dominante (minimo 75% della viewport).
- **Pannello Strumenti (HUD):** Flottante o laterale, stile console da laboratorio, con slider rifiniti in oro/ambra e caratteri monospace compatti.

---

## 5. Piano Operativo di Sviluppo

```plaintext
[FASE 1] -> Setup Repository & Pipeline CI/CD (GitHub Pages)
[FASE 2] -> Home Page Hub con Navigazione & Design System
[FASE 3] -> Sviluppo Modulo 01 (Pigmenti & Kubelka-Munk)
[FASE 4] -> Sviluppo Modulo 04 (Luce Radente 3D - Three.js)
[FASE 5] -> Sviluppo Modulo 02 (Gestalt & Scanpath)
[FASE 6] -> Sviluppo Modulo 03 (Morfogenesi Gray-Scott WebGL)
[FASE 7] -> Sviluppo Modulo 05 (FFT 2D & Web Audio)
[FASE 8] -> Sviluppo Modulo 06 (Chimera Museum & API Met)
[FASE 9] -> Stress Test, Ottimizzazione Performance & Audit Accessibilità
```