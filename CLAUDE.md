# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static Chinese-language university brochure website ("御风大学"). Pure vanilla HTML/CSS/JS — no frameworks, no build tools, no `package.json`.

## How to view

```bash
npx serve .          # or: python -m http.server 8000
```
Sub-pages need a local server for correct `../CSS/` / `../JavaScript/` relative paths.

## Architecture

- **One CSS, one JS**: `CSS/style.css` and `JavaScript/script.js` are shared by every main page. Styles are organized in labeled sections; JS is an IIFE at the bottom of `<body>`.
- **Shared page template**: `.top-bar` → `.main-nav` (logo + anchor links) → `.hero` → `.section` cards → footer (5 links: about, schools, admissions, campus, contact) → `.back-to-top`. Top-bar audience quick links point to alumni/faculty/students/visitors.
- **CDN dependencies**: Lenis (smooth scroll), GSAP + ScrollTrigger. Both loaded on every page.

## Key interaction patterns (all in `script.js`)

- **Scroll reveals**: `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale` → `IntersectionObserver` adds `.revealed` → CSS transition.
- **Expand blocks**: `[data-expand]` toggles `.active` on `#expand-{id}` (max-height transition). Auto-closes siblings.
- **Modal**: `[data-modal="id"]` opens modal. Close via overlay click, close button, or Escape. Form submit → "提交成功!" toast → auto-close after 1.5s.
- **Counters**: `.counter` with `data-target` → GSAP ScrollTrigger number animation.
- **Nav scroll**: Header gets box-shadow on scroll via Lenis event.

## CSS variables (`:root`)

`--crimson`, `--gold`, `--midnight`, `--slate`, `--cream`. Card surface: `.glass` / `.glass-dark`. Text accent: `.gradient-text`.

## Special pages

- **`HTML/library.html`**: Self-contained library microsite. Uses Tailwind CDN + inline styles + inline JS. Does NOT import `CSS/style.css` or `JavaScript/script.js`. Floating glass nav, bento grid.
- **`HTML/index_alt.html`**: Orphaned alternate homepage. Uses `CSS/style.css` but expects carousel/dropdown JS not present in `script.js`. Nothing links to it.
