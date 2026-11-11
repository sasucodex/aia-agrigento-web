<div align="center">
  <a href="https://aiaagrigento.it">
    <img src="./src/assets/logos/logo-aia-agrigento.svg" alt="Logo AIA FIGC Sezione di Agrigento" width="96" height="96" />
  </a>

  # Guida alla Contribuzione — AIA Agrigento Web

  <p>
    <a href="./CONTRIBUTING.md">🇬🇧 Read in English</a> · <strong>Italiano</strong> · <a href="./README.it.md">Torna al README</a>
  </p>
</div>

---

Grazie per contribuire al portale web ufficiale della **Sezione di Agrigento dell'Associazione Italiana Arbitri**.

Questo documento definisce le regole architetturali, i flussi di aggiornamento dei dati, le direttive del design system, i requisiti prestazionali e le regole di apertura delle Pull Request obbligatorie per qualsiasi modifica inviata a questo repository.

---

## Indice

1. [Principi Ingegneristici Fondamentali](#1-principi-ingegneristici-fondamentali)
2. [Come Aggiornare i Contenuti Sezionali (Flusso Data-Driven)](#2-come-aggiornare-i-contenuti-sezionali-flusso-data-driven)
3. [Design System Istituzionale e Linee Guida Editoriali](#3-design-system-istituzionale-e-linee-guida-editoriali)
4. [Regole per Componenti Astro Server-First e Isole React](#4-regole-per-componenti-astro-server-first-e-isole-react)
5. [Disciplina PageSpeed 100/100, Accessibilità e SEO](#5-disciplina-pagespeed-100100-accessibilità-e-seo)
6. [Flusso di Sviluppo e Protocollo di Verifica in 4 Passi](#6-flusso-di-sviluppo-e-protocollo-di-verifica-in-4-passi)
7. [Linee Guida per le Pull Request e Template Richiesto](#7-linee-guida-per-le-pull-request-e-template-richiesto)

---

## 1. Principi Ingegneristici Fondamentali

1. **Zero Dati Hardcoded nei Template:**
   Tutti i file `.astro` e `.tsx` sono esclusivamente motori di presentazione. È tassativamente vietato cablare elenchi di dirigenti, arbitri, premi, riunioni, documenti, statistiche o FAQ direttamente nel markup delle pagine o dei componenti.
2. **Separazione delle Responsabilità a Tre Livelli:**
   - **Livello Dati:** File JSON strutturati in `src/data/*.json` e costanti immutabili in `src/constants/*.ts`.
   - **Livello Tipi & Loader:** Interfacce TypeScript rigorose in `src/types/*.ts` e funzioni helper di caricamento in `src/lib/utils/*.ts`.
   - **Livello Presentazione:** Componenti `.astro` statici e isole interattive `.tsx` in `src/components/` e `src/pages/`.
3. **Coerenza Istituzionale ed Editoriale:**
   Il portale rispecchia l'autorevolezza di oltre 75 anni di storia arbitrale e l'identità federale della FIGC. È richiesto il rispetto rigoroso del tema chiaro ad alto contrasto, della gerarchia tipografica e della sobrietà visiva.
4. **Punteggio Pieno 100/100 su Google PageSpeed:**
   Ogni modifica deve preservare il punteggio di 100/100 su Performance, Accessibilità, Best Practices e SEO sia su smartphone che su desktop.

---

## 2. Come Aggiornare i Contenuti Sezionali (Flusso Data-Driven)

Gli aggiornamenti ordinari della vita sezionale devono richiedere **unicamente la modifica del file JSON o delle costanti corrispondenti**, senza toccare HTML, JSX o classi Tailwind:

| Operazione | File da Modificare | Note Operative |
| :--- | :--- | :--- |
| **Aggiornare il Consiglio Direttivo (CDS), Referenti o Collaboratori** | `src/data/board.json` | Aggiorna il record del dirigente e colloca la fotografia in `public/images/cds/`. |
| **Aggiornare l'Albo Storico dei Presidenti** | `src/data/presidents.json` | I ritratti storici risiedono in `public/images/presidents/`. |
| **Aggiornare l'Organico Sezionale (Benemeriti, Nazionali, CRA, OTS)** | `src/data/organico.json` | Suddiviso nelle sezioni `benemeriti`, `nazionali`, `regionali`, `ots_c11`, `ots_c5` e `ots_osservatori`. |
| **Aggiungere un Vincitore al Premio Livatino o ai Premi Storici** | `src/data/awards.json` | Contiene sia l'Albo d'Oro nazionale `livatino` (Serie A) sia i 9 premi `traditional`. |
| **Pubblicare o Modificare un Articolo del Blog** | `src/data/news.json` | Validato dall'interfaccia `Article` in `src/types/news.ts`. Le immagini di copertina vanno in `public/images/blog/`. |
| **Aggiornare il Calendario delle 16 Riunioni RTO** | `src/data/rto-calendar.json` | La prossima riunione in programma viene messa in evidenza automaticamente in base alla data. |
| **Aggiungere o Sostituire un Modulo PDF Sezionale** | `src/data/documents.json` | Carica il PDF in `public/documents/` e aggiorna i metadati e il campo `downloadUrl`. |
| **Aggiornare Orari del Polo Atletico o Soglie dei Test Fisici** | `src/data/polo.json`, `src/data/athletic-tests.json` | Le tracce audio MP3 dei test federali si trovano in `public/documents/audio/`. |
| **Aggiornare FAQ o Vantaggi del Corso Arbitri** | `src/data/faq.json`, `src/data/course.json` | Alimenta la pagina `/diventa-arbitro`. |
| **Aggiornare Statistiche Home o Link Ufficiali** | `src/data/stats.json`, `src/data/links.json` | Alimenta i 4 numeri sezionali e le sezioni a fasce blu con designazioni e comunicati. |
| **Aggiornare Sede, Orari Segreteria, Telefoni, Email o Social** | `src/constants/contacts.ts` | Si propaga automaticamente a Footer, `/contatti`, `/privacy` e pulsanti WhatsApp. |

---

## 3. Design System Istituzionale e Linee Guida Editoriali

Ogni intervento sull'interfaccia utente deve rispettare le regole stilistiche definite in [`src/styles/globals.css`](./src/styles/globals.css):

### 3.1 Tema Chiaro e Superfici

- **Sfondo Principale:** Bianco puro (`bg-white`), alternato a sezioni in grigio ardesia chiarissimo (`bg-slate-50`) per scandire il ritmo verticale.
- **Superfici Card e Riquadri:** `bg-white` con bordo nitido `border border-slate-200` e ombra leggera `shadow-xs`.
- **Sobrietà Visiva:** Non introdurre dark mode, sfondi neri, gradienti decorativi multicolore, ombre colorate o bordi spessi.

### 3.2 Tipografia Federale Ufficiale AIA FIGC

Il portale adotta il binomio tipografico ufficiale AIA FIGC, **interamente self-hosted** tramite `@fontsource` (zero richieste di rete verso `fonts.googleapis.com`):

- **Titoli, Overline e Pulsanti (`--font-heading: "Poppins"`):**
  - **Scala H1 / H2:** Applicare sempre `font-heading font-bold` (o `font-extrabold`), `tracking-tight`, `leading-[1.1]` (o `leading-tight`) e `text-balance` per garantire intestazioni compatte e autorevoli.
  - **Overline / Kicker Editoriali:** `font-heading text-xs font-semibold uppercase tracking-widest text-referee-gold` (o `text-[#004b97]`).
  - **Firma Visiva a Fasce Blu:** I titoli di sezione sono affiancati da filetti orizzontali nel blu federale (`h-[2px] bg-[#004b97]`).
- **Corpo del Testo, Articoli e Tabelle (`--font-sans: "Lato"`):**
  - **Paragrafi:** `font-sans text-sm sm:text-base text-slate-700 leading-relaxed text-pretty max-w-prose`. L'uso di `text-slate-700` (`#334155`) su fondo bianco supera il **rapporto di contrasto 10:1 (WCAG AAA)**.
  - **Dati Numerici e Date:** Includere sempre la classe `tabular-nums` (`font-sans text-xs text-slate-500 tabular-nums`) per allineare verticalmente date, orari e tabelle dell'organico.
- **Standardizzazione dei Font:** Utilizzare esclusivamente le famiglie `Poppins` e `Lato` configurate nel progetto.

### 3.3 Palette Cromatica Semantica dell'Arbitro

Utilizzare i token semantici dichiarati nel blocco `@theme` di [`src/styles/globals.css`](./src/styles/globals.css):

| Token | Esadecimale | Utilizzo Semantico |
| :--- | :--- | :--- |
| `--color-figc-blue` | `#004b97` | Header e Footer istituzionali, fasce orizzontali dei titoli, badge federali e link primari |
| `--color-referee-gold` | `#caa866` | Pulsante CTA primario (`bg-referee-gold text-slate-950`), accenti Premio Livatino e overline (`text-referee-gold`) — **privilegiare sempre questo token rispetto a classi generiche `amber-*`** |
| `--color-referee-red` | `#f80000` | Avvisi urgenti RTO, accenti disciplinari e display LED della pagina 404 |
| `--color-referee-green` | `#059835` | Badge del Polo Atletico e pulsanti ufficiali WhatsApp (`bg-emerald-600 hover:bg-emerald-700 text-white`) |

### 3.4 Composizione del Layout e Standard del Codice

1. **Layout Editoriali Strutturati:**
   Evitare di racchiudere ogni singolo recapito, orario di segreteria, data o beneficio del corso dentro una card con bordo e ombra. Presentare le informazioni di consultazione tramite elenchi a definizione (`<dl>`, `<dt>`, `<dd>`), tabelle tipografiche pulite (`divide-y divide-slate-100`) o layout asimmetrici a due colonne (`7/5`). Riservare le card a entità autonome e ricche (anteprime notizie con foto, ritratti Albo Livatino, form interattivi).
2. **Iconografia Funzionale:**
   Non inserire icone decorative accanto a testi già autoesplicativi (date, orari, indirizzi, nomi o voci di elenco). Utilizzare le icone esclusivamente per azioni funzionali: trigger di download file (`Download`), indicatori di link esterno (`ArrowUpRight`) o controlli mobile privi di testo dotati di `aria-label`.
3. **Micro-Interazioni Misurate:**
   Evitare ingrandimenti marcati (`hover:scale-105`) o traslazioni verticali sulle card. Utilizzare transizioni sobrie di bordo e ombra (`transition-all duration-200 hover:border-amber-500/50 hover:shadow-sm`) e un feedback discreto al click sui pulsanti (`active:scale-[0.98]`).
4. **Spaziature Proporzionate alla Densità:**
   - Contenitore standard: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
   - Ritmo verticale: Hero (`py-20 sm:py-32`), sezioni primarie (`py-16 sm:py-24`), sezioni di supporto (`py-12 sm:py-16`)
   - Padding card calibrato: schede operative compatte (`p-4 sm:p-5`), schede standard (`p-5 sm:p-6`), blocchi monumentali (`p-6 sm:p-10`)
5. **Codice Autoesplicativo:**
   Evitare commenti ridondanti che si limitano a ripetere il nome del componente o dell'istruzione. Scrivere codice pulito, semantico e rigorosamente tipizzato.

---

## 4. Regole per Componenti Astro Server-First e Isole React

1. **Default `.astro` Statico:**
   Qualsiasi componente che mostra testi, schede, tabelle o fotografie deve essere un componente `.astro` compilato sul server, inviando `0 KB` di JavaScript al browser.
2. **Isole React (`.tsx`) Solo Quando Indispensabile:**
   Utilizzare React esclusivamente quando è richiesto uno stato interattivo lato client, applicando sempre la direttiva di idratazione più parsimoniosa:
   - `client:media="(max-width: 768px)"` per componenti esclusivi per smartphone (`Drawer.tsx`).
   - `client:idle` per modali attivati dall'utente (`FormsModal.tsx`).
   - `client:visible` per componenti interattivi posizionati sotto la piega (`CourseForm.tsx`, `FAQAccordion.tsx`).
   - `client:load` solo quando l'interazione immediata all'apertura è la funzione primaria della pagina (`BlogExplorer.tsx` in `/blog`).

---

## 5. Disciplina PageSpeed 100/100, Accessibilità e SEO

- **Zero Cumulative Layout Shift (`CLS = 0`):** Ogni tag `<img>` e componente `<Image />` di Astro deve dichiarare attributi `width` e `height` espliciti (o un contenitore con aspect-ratio fisso).
- **Ottimizzazione LCP:** Le immagini hero sopra la piega devono utilizzare `loading="eager"` e `fetchpriority="high"`; tutte le immagini sotto la piega devono usare `loading="lazy"` e `decoding="async"`.
- **HTML5 Semantico e Accessibilità:**
  - Utilizzare i tag strutturali corretti (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  - Garantire **un solo tag `<h1>` per pagina** e una gerarchia di intestazioni nidificata senza salti (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
  - Fornire attributi `aria-label` descrittivi su tutti i pulsanti privi di testo visibile.
  - Garantire un'altezza minima di `44px` (`min-h-[44px]`) su tutti i bersagli touch per smartphone.
- **Link Esterni:** Includere sempre `target="_blank" rel="noopener noreferrer"`.

---

## 6. Flusso di Sviluppo e Protocollo di Verifica in 4 Passi

### Procedura di Contribuzione

1. Crea un branch descrittivo a partire da `main` (non effettuare mai commit diretti su `main`):
   ```bash
   git checkout -b feat/nome-funzionalita
   ```
2. Realizza modifiche atomiche e focalizzate rispettando le direttive di questo documento.
3. Utilizza lo standard [Conventional Commits](https://www.conventionalcommits.org/) per i messaggi di commit:
   - `feat:` nuova funzionalità o sezione
   - `fix:` correzione di bug o layout
   - `content:` aggiornamento dei dataset JSON in `src/data/` o dei documenti in `public/documents/`
   - `style:` formattazione o affinamenti grafici
   - `refactor:` ristrutturazione del codice senza variazioni funzionali
   - `docs:` aggiornamento della documentazione

### Protocollo Obbligatorio di Verifica in 4 Passi

Prima di effettuare il push del branch o aprire una Pull Request, **ogni contributore deve completare tutte e 4 le fasi di verifica**:

1. **Passo 1 — Formattazione e Build Statica di Produzione:**
   Formatta il codice con Prettier ed esegui la build completa di produzione tramite `pnpm`. Entrambi i comandi devono terminare con codice di uscita `0` e zero errori TypeScript o Astro:
   ```bash
   pnpm run format
   pnpm run build
   ```
2. **Passo 2 — Ispezione del Diff e Pulizia del Codice:**
   Controlla `git status` e `git diff` per assicurarti che non siano stati introdotti file orfani, `console.log` temporanei, dati hardcodati nei template o credenziali riservate.
3. **Passo 3 — Verifica Funzionale e Responsive:**
   Controlla la resa visiva tramite `pnpm run dev` o `pnpm run preview` sia su viewport smartphone (`360px–414px`) sia su viewport desktop (`1024px–1440px`), verificando l'assenza di scorrimento orizzontale indesiderato (`overflow-x`) e il corretto funzionamento di eventuali form o modali modificati.
4. **Passo 4 — Allineamento della Documentazione:**
   Se hai aggiunto un nuovo dataset, una rotta, uno script o una variabile d'ambiente, aggiorna sia [`README.md`](./README.md) che [`README.it.md`](./README.it.md) (e [`CONTRIBUTING.md`](./CONTRIBUTING.md) / [`CONTRIBUTING.it.md`](./CONTRIBUTING.it.md) in caso di modifiche architetturali).

---

## 7. Linee Guida per le Pull Request e Template Richiesto

**Ogni contributo deve essere presentato obbligatoriamente tramite una Pull Request (PR).** Non sono ammessi push diretti sul branch `main`.

Ogni Pull Request deve essere **completa, dettagliata e autoesplicativa**, in modo da consentire ai revisori di valutare immediatamente il perimetro delle modifiche, il rispetto dell'architettura Data-Driven e l'impatto visivo.

### Elementi Obbligatori di Ogni Pull Request

1. **Titolo Chiaro (in formato Conventional Commits):** es. `feat(organico): aggiunti badge assistenti regionali CRA` oppure `content(awards): inserito vincitore Premio Livatino 2025/2026`.
2. **Contesto e Motivazione ("Cosa e Perché"):** Spiegazione puntuale delle modifiche introdotte e dell'esigenza funzionale o sezionale che risolvono.
3. **Dettaglio Tecnico dei File Modificati:** Elenco strutturato dei dataset JSON (`src/data/`), dei tipi/helper (`src/types/`, `src/lib/`) o dei componenti (`src/components/`, `src/pages/`) toccati.
4. **Prove Visive (Obbligatorie per Modifiche UI):** Screenshot o brevi registrazioni Prima/Dopo sia su viewport **Mobile (`360px–414px`)** sia su viewport **Desktop (`1024px–1440px`)**.
5. **Checklist del Protocollo di Verifica:** Conferma dell'avvenuta esecuzione locale di tutti e 4 i passi di verifica.

### Template Consigliato per la Descrizione della Pull Request

Copia e compila il seguente schema all'apertura di una nuova Pull Request su GitHub:

```markdown
## Sintesi e Motivazione
<!-- Descrivi COSA modifica questa PR e PERCHÉ è necessaria. Indica eventuali issue collegate. -->

## Dettaglio delle Modifiche
- **Dati / Costanti (`src/data/`, `src/constants/`):**
  - ...
- **Tipi / Utility (`src/types/`, `src/lib/`):**
  - ...
- **Componenti / Pagine (`src/components/`, `src/pages/`):**
  - ...

## Prove Visive (Modifiche UI)
<!-- Allega gli screenshot su Mobile (360px-414px) e Desktop (1024px-1440px) se l'interfaccia è stata modificata. -->

## Checklist Protocollo di Verifica (4 Passi)
- [ ] **Passo 1 (Formattazione & Build):** `pnpm run format` e `pnpm run build` completati con codice `0` e zero errori TypeScript/Astro.
- [ ] **Passo 2 (Architettura & Design System):** Zero dati hardcodati nei file `.astro`/`.tsx`, Tema Chiaro e token grafici rispettati, `git diff` pulito.
- [ ] **Passo 3 (Verifica Responsive & Funzionale):** Testato su smartphone (`360px–414px`, zero `overflow-x`) e desktop (`1024px–1440px`).
- [ ] **Passo 4 (Documentazione):** Aggiornati `README.md` / `README.it.md` e `CONTRIBUTING.md` / `CONTRIBUTING.it.md` se necessario.
```
