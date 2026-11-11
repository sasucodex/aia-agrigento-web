<div align="center">
  <a href="https://aiaagrigento.it">
    <img src="./src/assets/logos/logo-aia-agrigento.svg" alt="AIA FIGC Sezione di Agrigento Logo" width="128" height="128" />
  </a>

  # AIA Agrigento - Official Website

  **Associazione Italiana Arbitri - Sezione di Agrigento**

  [![Astro](https://img.shields.io/badge/Astro-7.x-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
  [![React](https://img.shields.io/badge/React-19.x-149ECA?logo=react&logoColor=white)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-7.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://aiaagrigento.it)
  [![License](https://img.shields.io/badge/License-All_Rights_Reserved-004b97)](./LICENSE)

  <p>
    <strong>English</strong> · <a href="./README.it.md">🇮🇹 Leggi in Italiano</a> · <a href="./CONTRIBUTING.md">Contributing Guide</a> · <a href="./LICENSE">License</a> · <a href="https://aiaagrigento.it">aiaagrigento.it</a>
  </p>
</div>

---

## Overview

This repository contains the source code for the official web portal of the **Agrigento Section of the Italian Referees Association** (*Associazione Italiana Arbitri - Sezione di Agrigento*), founded in 1950.

Designed with a **Static-First Islands Architecture** and a **Data-Driven Modular Pattern**, the platform serves both the public and the ~150 active referees, assistant referees, and observers across the province of Agrigento:

1. **Institutional Showcase & Youth Recruitment (`/`, `/diventa-arbitro`)** — Communicates over 75 years of refereeing history, highlights sectional news, and provides a high-conversion recruitment funnel for the free National Referee Course (open to candidates aged 14–40).
2. **Field-Ready Members Hub (`/area-associati`)** — A mobile-first operational dashboard accessible in one tap, featuring quick links to *Sinfonia4You* and the national AIA portal, the seasonal calendar of 16 Mandatory Technical Meetings (RTO) with an online absence justification modal, downloadable match report templates and sectional PDFs with in-browser preview, the Aragona Athletic Training Center schedule with downloadable MP3 audio tracks for official AIA fitness tests (Yo-Yo, SDS, 40m, Ariet), and stadium accreditation requests.
3. **Historical Heritage & Prestige (`/la-sezione`, `/organico`, `/premi`)** — Preserves the Roll of Presidents since 1949, the Sectional Executive Board (CDS), the 110-page 70th Anniversary commemorative volume, the complete technical roster (Referees of Merit, National CAN/CON officials, CRA Sicilia regional officials, and provincial OTS officials), the **Judge Rosario Livatino National Award** (with its Serie A Roll of Honor), and the 9 Traditional Sectional Awards.
4. **100/100 PageSpeed & Privacy by Design (`/privacy`)** — Built for full scores across Performance, Accessibility (WCAG AAA contrast), Best Practices, and SEO on both mobile and desktop, with zero profiling cookies, self-hosted typography, and static WebP cartography.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Core Framework** | [Astro 7](https://astro.build/) | Static Site Generation (SSG), Islands Architecture, and Serverless API Routes |
| **Interactive UI** | [React 19](https://react.dev/) | Hydrated client-side islands for search/filtering, modals, mobile navigation, and forms |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling via `@tailwindcss/vite` and `@tailwindcss/typography` |
| **Language** | [TypeScript 7](https://www.typescriptlang.org/) | Strict static type checking across data schemas, utilities, and components |
| **Typography** | [Fontsource](https://fontsource.org/) | Self-hosted official AIA FIGC font pairing: **Poppins** (headings/UI) + **Lato** (body/data) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) | Client and server runtime schema validation |
| **Transactional Email** | [Nodemailer 10](https://nodemailer.com/) | Direct SSL/TLS SMTP delivery (`smtps.aruba.it`) with multipart HTML + Plain-Text templates |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) + `astro:assets` | Build-time WebP/AVIF optimization and explicit dimension enforcement |
| **Icons** | [Lucide React](https://lucide.dev/) | Functional UI iconography (downloads, external links, mobile controls) |
| **Deployment** | [Vercel](https://vercel.com/) (`@astrojs/vercel`) | Global Edge CDN for static pages and serverless function execution |
| **Code Quality** | [Prettier](https://prettier.io/) | Automated formatting with `prettier-plugin-astro` and `prettier-plugin-tailwindcss` |

---

## Architecture

### 1. Static-First Islands Strategy

Over **90% of the user interface** is compiled into pure, zero-JavaScript static HTML at build time through `.astro` components. Client-side React (`.tsx`) is strictly isolated to interactive islands and hydrated with granular directives to protect Core Web Vitals:

| Island Component | Location | Hydration Directive | Responsibility |
| :--- | :--- | :--- | :--- |
| `Drawer.tsx` | `src/components/shared/` | `client:media="(max-width: 768px)"` | Touch-friendly mobile navigation drawer (never downloaded on desktop) |
| `BlogExplorer.tsx` | `src/components/blog/` | `client:load` | Instant 60fps full-text search, macro-tag pills, multi-year filter, and pagination across 215+ articles |
| `CourseForm.tsx` | `src/components/course/` | `client:visible` | Referee course application form with Zod validation, minor notice, and WhatsApp fallback |
| `FAQAccordion.tsx` | `src/components/course/` | `client:visible` | Accessible expandable FAQ accordion on the recruitment page |
| `FormsModal.tsx` | `src/components/servizi/` | `client:idle` | Accessible modal dialog for RTO absence justifications and match accreditation requests |

### 2. Data-Driven Modularity

A foundational rule of this codebase is the **strict separation between structured data and presentation templates**. No `.astro` or `.tsx` component contains hardcoded lists, names, dates, or documents. Every domain follows a three-tier pipeline:

```text
[ Structured JSON in src/data/ or Constants in src/constants/ ]
                              │
                              ▼
[ TypeScript Interfaces in src/types/ & Loaders in src/lib/utils/ ]
                              │
                              ▼
[ Pure Presentation Components in src/components/ & src/pages/ ]
```

#### Dataset Reference Map

| Domain | Data Source | Type Definition | Loader Utility |
| :--- | :--- | :--- | :--- |
| **Executive Board (CDS), Referents & Staff** | `src/data/board.json` | `src/types/board.ts` | `src/lib/utils/members.ts` |
| **Historical Roll of Presidents (since 1949)** | `src/data/presidents.json` | `src/types/presidents.ts` | `src/lib/utils/presidents.ts` |
| **Sectional Roster (Benemeriti, National, CRA, OTS)** | `src/data/organico.json` | `src/types/organico.ts` | `src/lib/utils/organico.ts` |
| **Livatino National Award & 9 Traditional Awards** | `src/data/awards.json` | `src/types/awards.ts` | `src/lib/utils/awards.ts` |
| **News & Historical Blog Archive (215+ Articles)** | `src/data/news.json` | `src/types/news.ts` | `src/lib/utils/news.ts` |
| **Mandatory Technical Meetings (16 RTOs)** | `src/data/rto-calendar.json` | `src/types/services.ts` | `src/lib/utils/services.ts` |
| **Match Reports & Sectional PDF Forms** | `src/data/documents.json` | `src/types/services.ts` | `src/lib/utils/services.ts` |
| **Aragona Athletic Center & Fitness Tests** | `src/data/polo.json`, `src/data/athletic-tests.json` | `src/types/polo.ts` | `src/lib/utils/polo.ts` |
| **Course Benefits, Steps & Requirements** | `src/data/course.json` | `src/types/course.ts` | `src/lib/utils/course.ts` |
| **Referee Course FAQs** | `src/data/faq.json` | `src/types/faq.ts` | `src/lib/utils/faq.ts` |
| **Sectional Key Figures & Statistics** | `src/data/stats.json` | `src/types/stats.ts` | `src/lib/utils/stats.ts` |
| **Designations, Official Communiqués & AIA Links** | `src/data/links.json` | `src/types/links.ts` | `src/lib/utils/links.ts` |
| **Privacy & Cookie Policy Content (GDPR)** | `src/data/privacy.json` | `src/types/privacy.ts` | `src/lib/utils/privacy.ts` |
| **Main Navigation & Legal Links** | `src/constants/navigation.ts` | `src/types/navigation.ts` | — |
| **Headquarters Address, Hours, Phones & Socials** | `src/constants/contacts.ts` | `src/types/contacts.ts` | — |

---

## Project Structure

```text
aia-agrigento-web/
├── .github/
│   └── workflows/
│       └── weekly-deploy.yml        # Scheduled Saturday rebuild to refresh upcoming RTO status
├── public/
│   ├── documents/                   # Downloadable PDFs (RTO calendar, 70th anniversary book, forms) & MP3 audio tests
│   ├── images/                      # Public static photography (board, presidents, Livatino, blog covers)
│   ├── favicon.png                  # High-resolution PNG icon
│   └── favicon.svg                  # Official vector emblem of AIA Agrigento
├── scripts/
│   └── migrate_news.py              # Utility script for historical article normalization
├── src/
│   ├── assets/
│   │   ├── images/                  # Build-optimized covers, hero photography, static map, and 404 illustration
│   │   └── logos/                   # Official AIA Agrigento SVG and AIA/FIGC logos
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
│   ├── constants/                   # Immutable navigation and contact configurations
│   ├── data/                        # Typed JSON datasets driving all site content
│   ├── layouts/
│   │   └── Layout.astro             # Root HTML5 layout with Header, Footer, skip-link, and SEO metadata
│   ├── lib/
│   │   ├── emails/                  # Nodemailer SMTP client and HTML/Plain-Text email builders
│   │   └── utils/                   # Typed data loaders, date formatters, and class name helpers (cn.ts)
│   ├── pages/
│   │   ├── api/
│   │   │   └── forms/               # Serverless POST endpoints (iscrizione-corso, giustificazioni, accrediti)
│   │   ├── blog/                    # Blog archive index, SSG pagination ([...page]), and article routes ([slug])
│   │   ├── 404.astro                # Custom referee-themed 404 page with LED substitution board
│   │   ├── area-associati.astro     # Operational dashboard for section members
│   │   ├── contatti.astro           # Headquarters, opening hours, GPS links, and static WebP map
│   │   ├── diventa-arbitro.astro    # Referee recruitment landing page
│   │   ├── index.astro              # Institutional homepage
│   │   ├── la-sezione.astro         # Section history, Roll of Presidents, and Executive Board
│   │   ├── organico.astro           # Complete section roster by technical committee
│   │   ├── premi.astro              # Judge Rosario Livatino National Award & Traditional Awards
│   │   └── privacy.astro            # Full GDPR Privacy & Cookie Policy
│   ├── styles/
│   │   └── globals.css              # Tailwind CSS v4 @theme tokens, self-hosted fonts, and base rules
│   └── types/                       # TypeScript domain interfaces
├── .nvmrc                           # Node.js version specification (v22)
├── .prettierrc                      # Prettier configuration
├── astro.config.mjs                 # Astro configuration, integrations, and 301 redirects
├── CONTRIBUTING.md                  # Contribution guidelines (English)
├── CONTRIBUTING.it.md               # Contribution guidelines (Italian)
├── LICENSE                          # Proprietary license (All Rights Reserved)
├── package.json                     # Project dependencies and scripts
├── README.md                        # Repository documentation (English)
├── README.it.md                     # Repository documentation (Italian)
└── tsconfig.json                    # Strict TypeScript configuration with @/* path alias
```

---

## Getting Started

### Prerequisites

- **Node.js** `22.x` or higher (matches [`.nvmrc`](./.nvmrc))
- **pnpm** `10.x` or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sasucodex/aia-agrigento-web.git
   cd aia-agrigento-web
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm run dev
   ```
   The site will be available locally at `http://localhost:4321`.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts the local Astro development server with hot module replacement |
| `pnpm run build` | Builds the production static site and serverless endpoints |
| `pnpm run preview` | Serves the production build locally for pre-release inspection |
| `pnpm run format` | Formats all `.astro`, `.ts`, `.tsx`, `.css`, and `.json` files in `src/` with Prettier |
| `pnpm run astro` | Runs Astro CLI commands directly (e.g., `pnpm run astro check`) |

---

## Environment Variables & Email System

The portal features three operational forms that dispatch transactional emails through **Nodemailer** over direct SSL/TLS SMTP (`smtps.aruba.it`):

1. **Referee Course Registration** (`POST /api/forms/iscrizione-corso` $\rightarrow$ `corsoarbitri@aiaagrigento.it`)
2. **RTO Absence Justification** (`POST /api/forms/giustificazioni` $\rightarrow$ `giustificazionirto@aiaagrigento.it`)
3. **Match Accreditation Request** (`POST /api/forms/accrediti` $\rightarrow$ `accrediti@aiaagrigento.it`)

Each submission dispatches **two distinct multipart (HTML + Plain-Text) emails** with an inline CID-embedded section emblem:
- A formal **confirmation receipt** sent to the user's email address (`Reply-To: noreply@aiaagrigento.it`).
- An operational **notification** sent to the relevant sectional inbox (`Reply-To` set to the applicant's email for one-click replies).

All forms include an invisible **honeypot anti-spam field** (`website`) and transparent error reporting (returning HTTP `500` on SMTP failure so no submission is ever silently lost).

### Local Environment Setup

Configure the following environment variables in your local environment or in the Vercel dashboard for production:

```bash
SMTP_HOST=smtps.aruba.it
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@aiaagrigento.it
SMTP_PASS="your-aruba-mailbox-password"
```

---

## Deployment

### Continuous Deployment & Weekly RTO Refresh

- **Vercel Edge Network:** Merging a Pull Request into the `main` branch triggers an automatic build and deployment on Vercel via `@astrojs/vercel`.
- **Automated Weekly Rebuild:** Because the "Next RTO Meeting" highlight in `/area-associati` is computed at build time from `src/data/rto-calendar.json`, the GitHub Action in [`.github/workflows/weekly-deploy.yml`](./.github/workflows/weekly-deploy.yml) triggers a fresh Vercel deployment every Saturday at `05:00 UTC` via the `VERCEL_DEPLOY_HOOK` repository secret.

---

## Contributing

All contributions, content updates, and bug fixes **must be submitted via a detailed Pull Request** and adhere to the project's **Data-Driven Modularity** architecture and **Institutional Design System** (Light Theme, official AIA FIGC typography, semantic referee color tokens, and 100/100 PageSpeed standards).

Please read the full [**Contributing Guide (CONTRIBUTING.md)**](./CONTRIBUTING.md) (or the [**Italian Version (CONTRIBUTING.it.md)**](./CONTRIBUTING.it.md)) before opening a Pull Request.

---

## License & Institutional Ownership

- **License:** Proprietary — All Rights Reserved. See the [**LICENSE**](./LICENSE) file for the full legal terms (in English and Italian).
- **Institution:** Associazione Italiana Arbitri - Sezione di Agrigento - Via Matteo Cimarra, 38 - 92100 Agrigento (AG) - C.F./P.IVA `93070180844`
- **Designed & Engineered by:** [Samuele Gallo (@sasucodex)](https://github.com/sasucodex)

All rights reserved © Associazione Italiana Arbitri - Sezione di Agrigento.
