<div align="center">
  <a href="https://aiaagrigento.it">
    <img src="./src/assets/logos/logo-aia-agrigento.svg" alt="AIA FIGC Sezione di Agrigento Logo" width="128" height="128" />
  </a>

  # Contributing to AIA Agrigento Web

  <p>
    <strong>English</strong> · <a href="./CONTRIBUTING.it.md">🇮🇹 Leggi in Italiano</a> · <a href="./README.md">Back to README</a>
  </p>
</div>

---

Thank you for contributing to the official web portal of the **Agrigento Section of the Italian Referees Association**.

This document establishes the architectural rules, data-driven workflows, visual design standards, performance requirements, and Pull Request protocols required for every change submitted to this repository.

---

## Table of Contents

1. [Core Engineering Principles](#1-core-engineering-principles)
2. [Updating Sectional Content (Data-Driven Workflows)](#2-updating-sectional-content-data-driven-workflows)
3. [Institutional Design System & Editorial Guidelines](#3-institutional-design-system--editorial-guidelines)
4. [Astro Server-First & Islands Rules](#4-astro-server-first--islands-rules)
5. [PageSpeed 100/100, Accessibility & SEO](#5-pagespeed-100100-accessibility--seo)
6. [Development Workflow & 4-Pass Verification Protocol](#6-development-workflow--4-pass-verification-protocol)
7. [Pull Request Guidelines & Required Template](#7-pull-request-guidelines--required-template)

---

## 1. Core Engineering Principles

1. **Zero Hardcoded Data in Templates:**
   All `.astro` and `.tsx` files are strictly presentation engines. Never hardcode lists of board members, referees, awards, meetings, documents, statistics, or FAQs inside page or component markup.
2. **Three-Tier Data Separation:**
   - **Data Layer:** Structured JSON files in `src/data/*.json` and static configurations in `src/constants/*.ts`.
   - **Type & Loader Layer:** Strict TypeScript interfaces in `src/types/*.ts` and helper functions in `src/lib/utils/*.ts`.
   - **Presentation Layer:** Stateless `.astro` components and isolated `.tsx` islands in `src/components/` and `src/pages/`.
3. **Institutional & Editorial Consistency:**
   The portal reflects over 75 years of refereeing history and federal identity. Maintain a clean, high-contrast light theme, disciplined typographic hierarchy, and restrained visual composition.
4. **Uncompromising 100/100 Lighthouse Score:**
   Every change must preserve a 100/100 score across Performance, Accessibility, Best Practices, and SEO on both mobile and desktop viewports.

---

## 2. Updating Sectional Content (Data-Driven Workflows)

Routine sectional updates should **only** modify the corresponding JSON dataset or constant file, without touching UI markup:

| Task | File to Edit | Notes |
| :--- | :--- | :--- |
| **Update the Executive Board (CDS), Referents, or Staff** | `src/data/board.json` | Add/update the member record and place the portrait in `public/images/cds/`. |
| **Update the Historical Roll of Presidents** | `src/data/presidents.json` | Portraits are stored in `public/images/presidents/`. |
| **Update the Sectional Roster (Benemeriti, National, CRA, OTS)** | `src/data/organico.json` | Organized into `benemeriti`, `nazionali`, `regionali`, `ots_c11`, `ots_c5`, and `ots_osservatori`. |
| **Add a Winner to the Livatino Award or Traditional Awards** | `src/data/awards.json` | Contains both the Serie A `livatino` Roll of Honor and the 9 `traditional` sectional awards. |
| **Publish or Edit a News Article** | `src/data/news.json` | Validated against the `Article` interface in `src/types/news.ts`. Cover images go in `public/images/blog/`. |
| **Update the Seasonal RTO Calendar (16 Meetings)** | `src/data/rto-calendar.json` | The next upcoming meeting is automatically highlighted based on the current date. |
| **Add or Replace a Sectional PDF Form** | `src/data/documents.json` | Place the PDF file in `public/documents/` and register its metadata and `downloadUrl`. |
| **Update Athletic Center Info or Fitness Test Thresholds** | `src/data/polo.json`, `src/data/athletic-tests.json` | Audio MP3 tracks for fitness tests reside in `public/documents/audio/`. |
| **Update Referee Course FAQs or Benefits** | `src/data/faq.json`, `src/data/course.json` | Consumed by `/diventa-arbitro`. |
| **Update Homepage Statistics or External Links** | `src/data/stats.json`, `src/data/links.json` | Drives the 4 pride metrics and the horizontal blue-banded link sections on the homepage. |
| **Update Headquarters Info, Hours, Phones, or Socials** | `src/constants/contacts.ts` | Propagates automatically to the Footer, `/contatti`, `/privacy`, and WhatsApp triggers. |

---

## 3. Institutional Design System & Editorial Guidelines

All UI work must strictly adhere to the project's editorial design system defined in [`src/styles/globals.css`](./src/styles/globals.css):

### 3.1 Light Theme & Surfaces

- **Primary Background:** Pure white (`bg-white`), alternating with subtle slate (`bg-slate-50`) to separate major page sections.
- **Cards & Elevated Surfaces:** `bg-white` with a crisp `border border-slate-200` and subtle `shadow-xs`.
- **Visual Restraint:** Do not introduce dark mode, black backgrounds, multi-color decorative gradients, colored drop shadows, or heavy borders.

### 3.2 Official AIA FIGC Typography

The portal uses the official AIA FIGC font pairing, **100% self-hosted** via `@fontsource` (zero requests to `fonts.googleapis.com`):

- **Headings, Overlines & Buttons (`--font-heading: "Poppins"`):**
  - **H1 / H2 Scale:** Apply `font-heading font-bold` (or `font-extrabold`), `tracking-tight`, `leading-[1.1]` (or `leading-tight`), and `text-balance` for compact, authoritative headings.
  - **Editorial Overlines (Kickers):** `font-heading text-xs font-semibold uppercase tracking-widest text-referee-gold` (or `text-[#004b97]`).
  - **Section Header Signature:** Institutional section headings are framed by horizontal blue rules (`h-[2px] bg-[#004b97]`).
- **Body Copy, Articles & Data Tables (`--font-sans: "Lato"`):**
  - **Paragraphs:** `font-sans text-sm sm:text-base text-slate-700 leading-relaxed text-pretty max-w-prose`. Using `text-slate-700` (`#334155`) on white exceeds a **10:1 contrast ratio (WCAG AAA)**.
  - **Numeric & Date Metadata:** Always include `tabular-nums` (`font-sans text-xs text-slate-500 tabular-nums`) so dates, times, and roster tables align vertically.
- **Font Standardization:** Use only the configured `Poppins` and `Lato` font families across all components.

### 3.3 Semantic Referee Color Tokens

Use the custom theme tokens declared in [`src/styles/globals.css`](./src/styles/globals.css):

| Token | Hex | Semantic Usage |
| :--- | :--- | :--- |
| `--color-figc-blue` | `#004b97` | Institutional Header/Footer, horizontal title bands, federal badges, and primary links |
| `--color-referee-gold` | `#caa866` | Primary CTA buttons (`bg-referee-gold text-slate-950`), Livatino highlights, and editorial kickers (`text-referee-gold`) — **always prefer this token over generic `amber-*` utilities** |
| `--color-referee-red` | `#f80000` | Urgent RTO notices, disciplinary accents, and the 404 substitution board |
| `--color-referee-green` | `#059835` | Athletic Training Center badges and official WhatsApp buttons (`bg-emerald-600 hover:bg-emerald-700 text-white`) |

### 3.4 Layout Composition & Code Standards

1. **Structured Editorial Layouts:**
   Avoid enclosing every contact detail, opening hour, date, or course benefit inside a bordered card. Present structured reference data using semantic definition lists (`<dl>`, `<dt>`, `<dd>`), clean typographic tables (`divide-y divide-slate-100`), or asymmetric `7/5` two-column layouts. Reserve cards for self-contained entities (blog article previews, Livatino winner portraits, interactive forms).
2. **Functional Iconography:**
   Do not place decorative icons next to text that is already self-explanatory (dates, times, addresses, names, or standard list items). Use icons exclusively for functional actions: file download triggers (`Download`), external link indicators (`ArrowUpRight`), or icon-only mobile controls with an explicit `aria-label`.
3. **Subtle Micro-Interactions:**
   Avoid aggressive scale transforms (`hover:scale-105`) or vertical translations on cards. Use restrained border and shadow transitions (`transition-all duration-200 hover:border-amber-500/50 hover:shadow-sm`) and subtle button feedback (`active:scale-[0.98]`).
4. **Density-Aware Spacing:**
   - Standard container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
   - Vertical cadence: Hero (`py-20 sm:py-32`), primary sections (`py-16 sm:py-24`), support sections (`py-12 sm:py-16`)
   - Card padding scaled by density: compact operational items (`p-4 sm:p-5`), standard cards (`p-5 sm:p-6`), monumental focus blocks (`p-6 sm:p-10`)
5. **Self-Documenting Code:**
   Avoid redundant comments that merely restate the markup or variable names. Write clean, semantic, strictly typed code.

---

## 4. Astro Server-First & Islands Rules

1. **Default to `.astro` Components:**
   Any component that renders static content, cards, tables, or photography must be a server-rendered `.astro` component sending `0 KB` of JavaScript to the browser.
2. **Isolate Client State in React (`.tsx`):**
   Use React only when client-side state or event listeners are strictly required, and always pair the component with the least aggressive hydration directive:
   - `client:media="(max-width: 768px)"` for mobile-only UI (`Drawer.tsx`).
   - `client:idle` for modals triggered by user clicks (`FormsModal.tsx`).
   - `client:visible` for below-the-fold interactive components (`CourseForm.tsx`, `FAQAccordion.tsx`).
   - `client:load` only when immediate above-the-fold interactivity is the primary purpose of the page (`BlogExplorer.tsx` on `/blog`).

---

## 5. PageSpeed 100/100, Accessibility & SEO

- **Zero Cumulative Layout Shift (`CLS = 0`):** Every `<img>` and Astro `<Image />` must declare explicit `width` and `height` attributes (or a fixed aspect-ratio container).
- **LCP Optimization:** Above-the-fold hero images must use `loading="eager"` and `fetchpriority="high"`; below-the-fold images must use `loading="lazy"` and `decoding="async"`.
- **Semantic HTML5 & ARIA:**
  - Use proper landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  - Ensure exactly **one `<h1>` per page** and a strictly nested heading hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
  - Provide descriptive `aria-label` attributes on all icon-only buttons and interactive controls.
  - Ensure all mobile touch targets have a minimum height of `44px` (`min-h-[44px]`).
- **External Links:** Always include `target="_blank" rel="noopener noreferrer"`.

---

## 6. Development Workflow & 4-Pass Verification Protocol

### Step-by-Step Contribution Flow

1. Create a descriptive branch from `main` (never commit directly to `main`):
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make focused, atomic changes adhering to the guidelines above.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
   - `feat:` new feature or section
   - `fix:` bug or layout fix
   - `content:` updates to JSON datasets in `src/data/` or `public/documents/`
   - `style:` formatting or design token adjustments
   - `refactor:` code restructuring without behavioral change
   - `docs:` documentation updates

### Mandatory 4-Pass Verification Protocol

Before pushing a branch or opening a Pull Request, **every contributor must complete all 4 verification passes**:

1. **Pass 1 — Formatting & Production Build:**
   Run Prettier and execute a full production build using `pnpm`. Both commands must exit with code `0` and zero TypeScript or Astro errors:
   ```bash
   pnpm run format
   pnpm run build
   ```
2. **Pass 2 — Diff & Code Hygiene Inspection:**
   Inspect `git status` and `git diff` to verify that no orphan files, temporary `console.log` statements, hardcoded template data, or environment secrets were introduced.
3. **Pass 3 — Responsive & Functional Verification:**
   Preview the changes via `pnpm run dev` or `pnpm run preview` across both mobile viewports (`360px–414px`) and desktop viewports (`1024px–1440px`), verifying that there is no horizontal overflow (`overflow-x`) and that all interactive modals/forms behave as expected.
4. **Pass 4 — Documentation Alignment:**
   If you added a new dataset, route, script, or environment variable, update both [`README.md`](./README.md) and [`README.it.md`](./README.it.md) (as well as [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`CONTRIBUTING.it.md`](./CONTRIBUTING.it.md) if architectural rules changed).

---

## 7. Pull Request Guidelines & Required Template

**All contributions must be submitted through a Pull Request (PR).** Direct pushes to `main` are not permitted.

Every Pull Request must be **thorough, self-explanatory, and well-documented** so reviewers can immediately understand the scope, architectural compliance, and visual impact of the change.

### What Every Pull Request Must Include

1. **Clear Title (Conventional Commit format):** e.g., `feat(organico): add regional assistant referees badges` or `content(awards): add 2025/2026 Livatino award winner`.
2. **Context & Motivation ("What & Why"):** A detailed explanation of what changed and why the change was needed.
3. **Summary of Technical & Data Changes:** An explicit breakdown of modified JSON datasets (`src/data/`), TypeScript types (`src/types/`), utilities (`src/lib/`), or UI components (`src/components/`, `src/pages/`).
4. **Visual Evidence (Mandatory for UI Changes):** Before/After screenshots or screen recordings demonstrating the layout on both **Mobile (`360px–414px`)** and **Desktop (`1024px–1440px`)** viewports.
5. **Completed 4-Pass Verification Checklist:** Confirmation that all four verification passes were executed locally.

### Recommended Pull Request Description Template

Copy and fill out the following template when opening a Pull Request on GitHub:

```markdown
## Summary & Motivation
<!-- Describe WHAT this PR changes and WHY it is needed. Reference any related issue if applicable. -->

## Detailed Changes
- **Data / Constants (`src/data/`, `src/constants/`):**
  - ...
- **Types / Utilities (`src/types/`, `src/lib/`):**
  - ...
- **Components / Pages (`src/components/`, `src/pages/`):**
  - ...

## Visual Evidence (UI Changes)
<!-- Attach Mobile (360px-414px) and Desktop (1024px-1440px) screenshots if any UI/layout was modified. -->

## 4-Pass Verification Checklist
- [ ] **Pass 1 (Formatting & Build):** `pnpm run format` and `pnpm run build` completed with exit code `0` and zero TypeScript/Astro errors.
- [ ] **Pass 2 (Architecture & Design System):** Zero hardcoded data in `.astro`/`.tsx` templates, Light Theme and design tokens respected, and clean `git diff`.
- [ ] **Pass 3 (Responsive & Functional):** Verified on mobile (`360px–414px`, zero `overflow-x`) and desktop (`1024px–1440px`).
- [ ] **Pass 4 (Documentation):** Updated `README.md` / `README.it.md` and `CONTRIBUTING.md` / `CONTRIBUTING.it.md` if applicable.
```
