# Package Info Component

A reactive, multi-view npm intelligence widget designed for hyperDart. It features a natural language intent parser, real-time npm registry & download data fetching and an interactive multi-view interface for single package exploration, side-by-side comparisons, alternative recommendations, version diff analysis and use-case recommendations.

---

## Concept & Design Decisions

* **Problem Solved**: Developers often lose time visiting multiple websites to compare package download metrics, bundle sizes, version diffs, and licensing. This component provides an instant, all-in-one answer directly in the search interface.
* **Bespoke Glassmorphic UI**: Custom-built from scratch with raw CSS, avoiding generic component libraries or copied templates. Designed responsively for both **Mainline (780px)** and **Sidebar (340px)** views in both Light and Dark modes.
* **Zero-State Interactive Navigation**: Users can trigger follow-up actions like "Compare with..." or "See Alternatives" directly from card buttons without typing new search queries.

---

## Features

* **Natural Language Query Engine**: Automatically classifies free-form developer queries (*single package, latest version, comparisons, alternatives, version diffs, and generic use-cases*) dynamically.
* **Multi-View Intelligence**: 
  * **Single Package View**: Live download metrics, unpacked size, dependency counts, release dates, TypeScript/ESM compatibility badges and deprecation warnings.
  * **Comparison View**: Side-by-side metric tables and factual takeaways comparing up to 3 npm packages.
  * **Alternatives View**: Ranked similar package suggestions based on target library.
  * **Version Diff View**: Comparative breakdown across major package releases (e.g., `express 4 vs 5`).
  * **Use-Case View**: Semantic recommendations based on user requirements.

---

## Data Sources & APIs Used

* **npm Registry API (`https://registry.npmjs.org/{package}`)**: Metadata, versions, maintainers, dependencies, size, and deprecation status[cite: 7].
* **npm Download Counts API (`https://api.npmjs.org/downloads/...`)**: Live weekly and monthly download ranges for trend visualizations.
* **npm Search API (`https://registry.npmjs.org/-/v1/search`)**: Real-time querying for use-case and alternative package resolution.

---

## AI Disclosure & Author Contribution

* **AI Assistance**: AI tools (Gemini) were utilized for rapid CSS prototyping, regex refinement in the intent parser and debugging Vite module imports.
* **Original Work**: Entire component structure, custom intent parser, dynamic React state logic in `App.jsx`, API integration and non-template UI design.

---

## Tech Stack

* **Framework**: React.js + Vite
* **Styling**: CSS
* **Data Sources**: Public npm Registry & Downloads API

---
