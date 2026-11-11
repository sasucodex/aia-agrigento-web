<div align="center">
  <a href="https://aiaagrigento.it">
    <img src="./src/assets/logos/logo-aia-agrigento.svg" alt="Logo AIA FIGC Sezione di Agrigento" width="128" height="128" />
  </a>

  # AIA Agrigento — Portale Web Ufficiale

  **Associazione Italiana Arbitri - Sezione di Agrigento**

  [![Astro](https://img.shields.io/badge/Astro-7.x-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
  [![React](https://img.shields.io/badge/React-19.x-149ECA?logo=react&logoColor=white)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://aiaagrigento.it)
  [![Licenza](https://img.shields.io/badge/Licenza-Tutti_i_Diritti_Riservati-004b97)](./LICENSE)

  <p>
    <a href="./README.md">🇬🇧 Read in English</a> · <strong>Italiano</strong> · <a href="./CONTRIBUTING.it.md">Guida alla Contribuzione</a> · <a href="./LICENSE">Licenza</a> · <a href="https://aiaagrigento.it">aiaagrigento.it</a>
  </p>
</div>

---

## Panoramica del Progetto

Questo repository contiene il codice sorgente del portale web ufficiale della **Sezione di Agrigento dell'Associazione Italiana Arbitri**, fondata nel 1950.

Progettato secondo un'architettura **Static-First a Isole (Islands Architecture)** e un paradigma **Data-Driven Modulare**, il portale risponde alle esigenze sia del pubblico esterno sia dei circa 150 arbitri, assistenti e osservatori operanti nella provincia di Agrigento:

1. **Vetrina Istituzionale & Reclutamento Giovanile (`/`, `/diventa-arbitro`)** — Racconta gli oltre 75 anni di storia sezionale, valorizza le notizie di attualità e mette in primo piano il percorso di iscrizione al Corso Nazionale Arbitri gratuito (aperto dai 14 ai 40 anni).
2. **Area Associati Operativa da Campo (`/area-associati`)** — Una dashboard mobile-first accessibile in un solo tocco dall'Header, dotata di collegamenti rapidi a *Sinfonia4You* e al portale AIA Nazionale, calendario stagionale delle 16 Riunioni Tecniche Obbligatorie (RTO) con modale per l'invio delle giustificazioni, modulistica sezionale e referti di gara in anteprima PDF, orari del Polo Atletico di Aragona con tracce audio MP3 scaricabili dei 4 test atletici federali (Yo-Yo, SDS, 40m, Ariet) e modale per la richiesta di accrediti negli stadi.
3. **Prestigio e Tradizione Sezionale (`/la-sezione`, `/organico`, `/premi`)** — Custodisce l'Albo storico dei Presidenti dal 1949 a oggi, il Consiglio Direttivo Sezionale (CDS), il volume celebrativo dei 70 anni (110 pagine in PDF), l'organico tecnico completo (Arbitri Benemeriti, ufficiali nazionali CAN/CON, regionali CRA Sicilia e provinciali OTS), il **Premio Nazionale Giudice Beato Rosario Livatino** (con l'Albo d'Oro degli arbitri di Serie A) e i 9 Premi della Tradizione Sezionale.
4. **Disciplina PageSpeed 100/100 & Privacy by Design (`/privacy`)** — Ingegnerizzato per conseguire 100/100 su Performance, Accessibilità (contrasto WCAG AAA), Best Practices e SEO sia su smartphone che su desktop, con totale assenza di cookie di profilazione, font self-hosted e cartografia statica in formato WebP.

---

## Stack Tecnologico

| Livello | Tecnologia | Ruolo nel Progetto |
| :--- | :--- | :--- |
| **Framework Core** | [Astro 7](https://astro.build/) | Generazione statica (SSG), Architettura a Isole ed endpoint API serverless |
| **Isole Interattive** | [React 19](https://react.dev/) | Componenti client-side isolati per ricerca/filtri live, modali, drawer mobile e form |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Styling utility-first tramite `@tailwindcss/vite` e `@tailwindcss/typography` |
| **Linguaggio** | [TypeScript 7](https://www.typescriptlang.org/) | Tipizzazione statica `strict` per dataset JSON, loader e componenti |
| **Tipografia** | [Fontsource](https://fontsource.org/) | Binomio ufficiale AIA FIGC self-hosted: **Poppins** (titoli/UI) + **Lato** (corpo/tabelle) |
| **Form & Validazione** | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) | Validazione runtime degli schemi dati lato client e lato server |
| **Email Transazionali** | [Nodemailer 10](https://nodemailer.com/) | Invio SMTP diretto SSL/TLS (`smtps.aruba.it`) con template multi-part HTML + Plain-Text |
| **Ottimizzazione Immagini** | [Sharp](https://sharp.pixelplumbing.com/) + `astro:assets` | Conversione WebP/AVIF a tempo di build e dimensioni esplicite (zero CLS) |
| **Icone** | [Lucide React](https://lucide.dev/) | Iconografia funzionale (download file, link esterni, controlli mobile) |
| **Deployment** | [Vercel](https://vercel.com/) (`@astrojs/vercel`) | Distribuzione su Edge CDN globale ed esecuzione funzioni serverless |
| **Qualità Codice** | [Prettier](https://prettier.io/) | Formattazione automatica con `prettier-plugin-astro` e `prettier-plugin-tailwindcss` |

---

## Architettura del Sistema

### 1. Strategia Static-First a Isole (Islands Architecture)

Oltre il **90% dell'interfaccia** è compilato a tempo di build in puro HTML statico a zero JavaScript tramite componenti `.astro`. L'uso di React (`.tsx`) è circoscritto alle sole isole interattive, idratate con direttive parsimoniose per massimizzare i Core Web Vitals:

| Isola React | Percorso | Direttiva di Idratazione | Funzione |
| :--- | :--- | :--- | :--- |
| `Drawer.tsx` | `src/components/shared/` | `client:media="(max-width: 768px)"` | Menu mobile a scomparsa per smartphone (mai scaricato su desktop) |
| `BlogExplorer.tsx` | `src/components/blog/` | `client:load` | Ricerca live a 60 fps, filtri macro-tag, multiselezione per anno e paginazione istantanea su oltre 215 articoli |
| `CourseForm.tsx` | `src/components/course/` | `client:visible` | Modulo di candidatura al Corso Arbitri con validazione Zod, tutela minori e canale rapido WhatsApp |
| `FAQAccordion.tsx` | `src/components/course/` | `client:visible` | Domande frequenti espandibili nella pagina di reclutamento |
| `FormsModal.tsx` | `src/components/servizi/` | `client:idle` | Modale accessibile per l'invio di Giustificazioni RTO e Richieste di Accredito Gare |

### 2. Modularità Data-Driven (Separazione Dati / Presentazione)

Una regola cardine del repository è il **totale disaccoppiamento tra dati strutturati e componenti di visualizzazione**. Nessun file `.astro` o `.tsx` contiene elenchi, nomi, date o link cablati nel codice (hardcoded). Ogni dominio applicativo segue un flusso a tre livelli:

```text
[ File JSON puri in src/data/ o Costanti in src/constants/ ]
                              │
                              ▼
[ Interfacce TypeScript in src/types/ & Loader in src/lib/utils/ ]
                              │
                              ▼
[ Componenti di Presentazione in src/components/ & src/pages/ ]
```

#### Mappa dei Dataset Strutturati

| Dominio Contenuto | Sorgente Dati | Definizione Tipi | Utility di Caricamento |
| :--- | :--- | :--- | :--- |
| **Consiglio Direttivo (CDS), Referenti e Collaboratori** | `src/data/board.json` | `src/types/board.ts` | `src/lib/utils/members.ts` |
| **Albo Storico dei Presidenti (dal 1949)** | `src/data/presidents.json` | `src/types/presidents.ts` | `src/lib/utils/presidents.ts` |
| **Organico Sezionale (Benemeriti, Nazionali, CRA, OTS)** | `src/data/organico.json` | `src/types/organico.ts` | `src/lib/utils/organico.ts` |
| **Albo d'Oro Livatino & 9 Premi della Tradizione** | `src/data/awards.json` | `src/types/awards.ts` | `src/lib/utils/awards.ts` |
| **Archivio Blog & Notizie Storiche (215+ Articoli)** | `src/data/news.json` | `src/types/news.ts` | `src/lib/utils/news.ts` |
| **Calendario Stagionale delle 16 RTO** | `src/data/rto-calendar.json` | `src/types/services.ts` | `src/lib/utils/services.ts` |
| **Referti Gara e Modulistica Sezionale PDF** | `src/data/documents.json` | `src/types/services.ts` | `src/lib/utils/services.ts` |
| **Polo Atletico di Aragona & 4 Test Federali** | `src/data/polo.json`, `src/data/athletic-tests.json` | `src/types/polo.ts` | `src/lib/utils/polo.ts` |
| **Vantaggi, Tappe e Requisiti del Corso Arbitri** | `src/data/course.json` | `src/types/course.ts` | `src/lib/utils/course.ts` |
| **Domande Frequenti (FAQ) Corso Arbitri** | `src/data/faq.json` | `src/types/faq.ts` | `src/lib/utils/faq.ts` |
| **Statistiche e Numeri Sezionali** | `src/data/stats.json` | `src/types/stats.ts` | `src/lib/utils/stats.ts` |
| **Designazioni, Comunicati Ufficiali e Link AIA** | `src/data/links.json` | `src/types/links.ts` | `src/lib/utils/links.ts` |
| **Testi Informativa Privacy & Cookie Policy (GDPR)** | `src/data/privacy.json` | `src/types/privacy.ts` | `src/lib/utils/privacy.ts` |
| **Voci di Navigazione Primaria e Link Legali** | `src/constants/navigation.ts` | `src/types/navigation.ts` | — |
| **Sede, Orari Segreteria, Telefoni, Email e Social** | `src/constants/contacts.ts` | `src/types/contacts.ts` | — |

---

## Struttura del Repository

```text
aia-agrigento-web/
├── .github/
│   └── workflows/
│       └── weekly-deploy.yml        # Deploy automatico del sabato per aggiornare la prossima RTO
├── public/
│   ├── documents/                   # PDF scaricabili (calendario RTO, libro 70 anni, moduli) e tracce MP3 test atletici
│   ├── images/                      # Fotografie statiche pubbliche (CDS, presidenti, Livatino, copertine blog)
│   ├── favicon.png                  # Favicon PNG ad alta risoluzione
│   └── favicon.svg                  # Stemma vettoriale ufficiale della Sezione AIA di Agrigento
├── scripts/
│   └── migrate_news.py              # Script di supporto per la normalizzazione degli articoli storici
├── src/
│   ├── assets/
│   │   ├── images/                  # Copertine ottimizzate, foto hero, mappa statica WebP e tabellone 404
│   │   └── logos/                   # Logo ufficiale AIA Agrigento in SVG e loghi federali AIA/FIGC
│   ├── components/
│   │   ├── blog/                    # BlogHero, BlogExplorer (React), ArticleRow (React), BlogShare
│   │   ├── contatti/                # ContattiHero, SedeMappaSection, SocialSection
│   │   ├── course/                  # CourseHero, CourseBenefits, CourseSteps, FAQAccordion, CourseForm
│   │   ├── home/                    # HeroSection, NumeriSezionali, LatestBlog, BlogCard, HomeQuickLinks
│   │   ├── organico/                # OrganicoHero, BenemeritiGrid/Table, NazionaliGrid, RegionaliGrid, OTSSection
│   │   ├── premi/                   # PremiHero, LivatinoSection, AlboOroLivatinoGrid, PremiTradizione
│   │   ├── servizi/                 # AreaHero, RTOSection, DocumentiSection, PoloSection, AccreditiSection, FormsModal
│   │   ├── sezione/                 # StoriaIntro, AlboPresidenti, PresidentCard, ConsiglioDirettivo, ConsiglioCard
│   │   └── shared/                  # Header, Footer, Drawer (React), SEO
│   ├── constants/                   # Costanti immutabili di navigazione e recapiti sezionali
│   ├── data/                        # Dataset JSON tipizzati che alimentano tutte le pagine
│   ├── layouts/
│   │   └── Layout.astro             # Layout radice HTML5 con Header, Footer, skip-link e metadati SEO
│   ├── lib/
│   │   ├── emails/                  # Client SMTP Nodemailer e generatori email HTML/Plain-Text
│   │   └── utils/                   # Loader tipizzati dei dati, formattazione date e helper classi (cn.ts)
│   ├── pages/
│   │   ├── api/
│   │   │   └── forms/               # Endpoint POST serverless (iscrizione-corso, giustificazioni, accrediti)
│   │   ├── blog/                    # Indice archivio blog, paginazione SSG ([...page]) e singola notizia ([slug])
│   │   ├── 404.astro                # Pagina 404 a tema arbitrale con tabellone luminoso delle sostituzioni
│   │   ├── area-associati.astro     # Dashboard operativa per gli associati della sezione
│   │   ├── contatti.astro           # Sede sezionale, orari, pulsanti GPS e mappa statica WebP
│   │   ├── diventa-arbitro.astro    # Landing page per il reclutamento al Corso Arbitri
│   │   ├── index.astro              # Homepage istituzionale
│   │   ├── la-sezione.astro         # Storia sezionale, Albo dei Presidenti e Consiglio Direttivo
│   │   ├── organico.astro           # Organico sezionale suddiviso per organo tecnico
│   │   ├── premi.astro              # Premio Nazionale Giudice Livatino e Premi della Tradizione
│   │   └── privacy.astro            # Informativa Privacy & Cookie Policy conforme al GDPR
│   ├── styles/
│   │   └── globals.css              # Token @theme di Tailwind CSS v4, font self-hosted e stili base
│   └── types/                       # Interfacce TypeScript dedicate per ogni dominio
├── .nvmrc                           # Versione Node.js di riferimento (v22)
├── .prettierrc                      # Configurazione Prettier
├── astro.config.mjs                 # Configurazione Astro, integrazioni e redirect permanenti 301
├── CONTRIBUTING.md                  # Guida alla contribuzione (Inglese)
├── CONTRIBUTING.it.md               # Guida alla contribuzione (Italiano)
├── LICENSE                          # Licenza proprietaria (Tutti i diritti riservati)
├── package.json                     # Dipendenze e script di progetto
├── README.md                        # Documentazione del repository (Inglese)
├── README.it.md                     # Documentazione del repository (Italiano)
└── tsconfig.json                    # Configurazione TypeScript strict con alias @/*
```

---

## Avvio Rapido e Sviluppo Locale

### Prerequisiti

- **Node.js** `22.x` o superiore (come definito in [`.nvmrc`](./.nvmrc))
- **pnpm** `10.x` o superiore

### Installazione

1. **Clona il repository:**
   ```bash
   git clone https://github.com/sasucodex/aia-agrigento-web.git
   cd aia-agrigento-web
   ```

2. **Installa le dipendenze:**
   ```bash
   pnpm install
   ```

3. **Avvia il server di sviluppo:**
   ```bash
   pnpm run dev
   ```
   Il portale sarà accessibile localmente all'indirizzo `http://localhost:4321`.

### Script Disponibili

| Comando | Descrizione |
| :--- | :--- |
| `pnpm run dev` | Avvia il server di sviluppo Astro con aggiornamento a caldo (HMR) |
| `pnpm run build` | Compila il sito statico e gli endpoint serverless per la produzione |
| `pnpm run preview` | Avvia un server locale per testare la build di produzione prima del rilascio |
| `pnpm run format` | Formatta tutti i file `.astro`, `.ts`, `.tsx`, `.css` e `.json` in `src/` tramite Prettier |
| `pnpm run astro` | Esegue direttamente la CLI di Astro (es. `pnpm run astro check`) |

---

## Variabili d'Ambiente e Sistema Email

Il portale gestisce tre moduli operativi che inviano email transazionali tramite **Nodemailer** su connessione diretta SSL/TLS (`smtps.aruba.it`):

1. **Iscrizione Corso Arbitri** (`POST /api/forms/iscrizione-corso` $\rightarrow$ `corsoarbitri@aiaagrigento.it`)
2. **Giustificazioni Assenze RTO** (`POST /api/forms/giustificazioni` $\rightarrow$ `giustificazionirto@aiaagrigento.it`)
3. **Richiesta Accrediti Gare** (`POST /api/forms/accrediti` $\rightarrow$ `accrediti@aiaagrigento.it`)

Ogni invio genera **due email distinte in formato multi-part (HTML + Plain-Text)** con stemma sezionale incorporato inline via CID:
- Una **ricevuta di conferma** recapitata all'utente o associato (`Reply-To: noreply@aiaagrigento.it`).
- Una **notifica operativa** inviata alla casella sezionale competente (`Reply-To` impostato sull'indirizzo email del richiedente per consentire alla segreteria di rispondere con un click).

Tutti i form integrano un campo **honeypot anti-spam invisibile** (`website`) e una gestione veritiera degli errori (restituendo HTTP `500` in caso di mancato recapito SMTP, evitando falsi positivi).

### Configurazione Locale

Configura le seguenti variabili d'ambiente nel tuo ambiente di sviluppo locale oppure nel pannello di Vercel per la produzione:

```bash
SMTP_HOST=smtps.aruba.it
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@aiaagrigento.it
SMTP_PASS="password-della-casella-aruba"
```

---

## Deployment

### Rilascio Continuo e Aggiornamento Settimanale RTO

- **Vercel Edge Network:** Il merge di una Pull Request sul branch `main` avvia automaticamente la build e la distribuzione globale su Vercel tramite `@astrojs/vercel`.
- **Rebuild Settimanale Automatizzato:** Poiché il riquadro "Prossima Riunione Tecnica" in `/area-associati` viene calcolato a tempo di build a partire da `src/data/rto-calendar.json`, il workflow GitHub Actions in [`.github/workflows/weekly-deploy.yml`](./.github/workflows/weekly-deploy.yml) invoca una nuova build ogni sabato alle `05:00 UTC` tramite il secret `VERCEL_DEPLOY_HOOK`.

---

## Contribuire al Progetto

Ogni contributo, aggiornamento dei dati sezionali o correzione **deve essere inviato tramite una Pull Request dettagliata** e rispettare rigorosamente l'architettura **Data-Driven Modulare** e il **Design System Istituzionale** del progetto (Tema Chiaro su sfondo bianco, tipografia federale AIA FIGC, token cromatici semantici e standard PageSpeed 100/100).

Consulta la [**Guida alla Contribuzione in Italiano (CONTRIBUTING.it.md)**](./CONTRIBUTING.it.md) (oppure la [**Versione Inglese (CONTRIBUTING.md)**](./CONTRIBUTING.md)) prima di aprire una Pull Request.

---

## Licenza e Titolarità Istituzionale

- **Licenza:** Proprietaria — Tutti i diritti riservati. Consulta il file [**LICENSE**](./LICENSE) per le condizioni legali integrali (in inglese e in italiano).
- **Ente Titolare:** Associazione Italiana Arbitri - Sezione di Agrigento - Via Matteo Cimarra, 38 - 92100 Agrigento (AG) - C.F./P.IVA `93070180844`
- **Progettazione e Sviluppo:** [Samuele Gallo (@sasucodex)](https://github.com/sasucodex)

Tutti i diritti riservati © Associazione Italiana Arbitri - Sezione di Agrigento.
