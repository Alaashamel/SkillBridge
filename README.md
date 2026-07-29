# SkillBridge 🗺️

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Language](https://img.shields.io/badge/language-JavaScript-informational.svg) ![Last Commit](https://img.shields.io/github/last-commit/Alaashamel/SkillBridge)


> A personal learning roadmap tracker — built with vanilla HTML, CSS & JavaScript.

Try now => https://skill-bridge-pied.vercel.app/

---

## 🚀 Getting Started

No build tools, no npm, no dependencies.

```bash
# Clone or unzip the project
cd skillbridge

# Open in browser (any of these work)
open index.html
# or just double-click index.html in your file manager
```

For local development with live-reload, use VS Code's **Live Server** extension or:

```bash
npx serve .
```

---

## 📁 Project Structure

```
skillbridge/
├── index.html                  ← App shell & all static markup
│
├── assets/
│   ├── css/
│   │   ├── main.css            ← Design tokens, reset, layout shell
│   │   ├── components.css      ← Reusable UI: buttons, cards, modals, toasts
│   │   └── pages.css           ← Page-specific: detail, settings styles
│   │
│   └── js/
│       ├── state.js            ← Data model & localStorage persistence
│       ├── ui.js               ← Theme, toast, modal, sidebar, icon picker
│       ├── router.js           ← Client-side page navigation
│       ├── dashboard.js        ← Dashboard render, stats, filters, skill CRUD
│       ├── detail.js           ← Skill detail page & step management
│       └── app.js              ← Entry point — bootstraps the whole app
│
└── README.md
```

---

## 🧠 Architecture

### Module Pattern
Each JS file exposes a single `const` namespace using the **IIFE module pattern** — no bundler needed, no global pollution:

```js
const Dashboard = (() => {
  // private internals
  function _renderGrid() { ... }

  // public API
  return { render, setFilter };
})();
```

### Data Flow
```
User Action
    ↓
Action Handler (SkillActions / StepActions / SettingsActions)
    ↓
State mutation (State.addSkill / State.toggleStep / ...)
    ↓
localStorage.setItem (auto-persisted in State)
    ↓
Re-render (Dashboard.render / DetailPage.render)
```

### Modules & Responsibilities

| File | Responsibility |
|---|---|
| `state.js` | Single source of truth. All reads & writes go through here. |
| `ui.js` | Pure UI side-effects: theme, toasts, modals, sidebar. |
| `router.js` | Page switching, title updates, settings HTML injection. |
| `dashboard.js` | Stat cards, skill grid, filter chips, skill creation. |
| `detail.js` | Skill hero, circular progress, roadmap phases, steps. |
| `app.js` | Bootstrap: load state → init UI → inject HTML → render. |

---

## ✨ Features

- ✅ Add skills with icon, category & difficulty
- ✅ 3-phase roadmap: Beginner → Intermediate → Advanced
- ✅ Real-time progress bars & circular progress ring
- ✅ Check/uncheck steps with live progress update
- ✅ Filter skills by status (All / In Progress / Completed)
- ✅ Dark / Light mode with CSS variables
- ✅ Toast notifications (success & error)
- ✅ Empty states with helpful CTAs
- ✅ Right-click context menu (Open / Delete)
- ✅ Export data as JSON
- ✅ LocalStorage persistence
- ✅ Mobile-first responsive design

---

## 🎨 Design System

All visual tokens live in `main.css` under `:root {}`.

| Token | Value |
|---|---|
| `--accent` | `#c96a2e` (burnt orange) |
| `--accent-2` | `#3d7a6e` (slate teal) |
| `--font-display` | Syne (Google Fonts) |
| `--font-body` | DM Sans (Google Fonts) |

---

## 📦 Extending the Project

**Add a new page:**
1. Add a `<div class="page" id="page-yourpage">` in `index.html`
2. Add a nav item in the sidebar
3. Call `Router.go('yourpage', navEl)` on click
4. Add page title to `PAGE_TITLES` in `router.js`

**Add a new skill field:**
1. Add it to the modal form in `index.html`
2. Read it in `SkillActions.save()` in `dashboard.js`
3. Include it in the skill object stored in `State.addSkill()`

---

## 📄 License

MIT — free to use, modify, and showcase in your portfolio.
