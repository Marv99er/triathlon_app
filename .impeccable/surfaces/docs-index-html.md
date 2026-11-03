---
version: 1
slug: "docs-index-html"
primary_target: "docs/index.html"
related_targets: ["docs/css/styles.css","docs/js/dashboard.js","docs/js/competitions.js"]
---

# TriLog PWA – app shell and Übersicht

Scope: whole PWA (docs/), first surface the Übersicht (week) screen, plus Rennen split. Mode: Operate.
Job: at a glance, am I on course for my next race; log fast one-handed after/during training.
Constraints: PRODUCT.md; vanilla JS/CSS, offline PWA, German UI, dark scene (gym, evening, outdoors).
Unresolved: Plan tab demoted into Rennen/Woche or settings; Kraft stays a tab.

## Direction contract

THESIS: The week is a transition zone: every day is a numbered rack slot, every session a swim cap in its sport's colour, sized by duration. Refuses the iOS grey-tile dashboard with system blue.

OWN-WORLD: Near-black rubber-mat ground (#111315) with raised charcoal plates; latex cap colours as data only: swim electric blue, bike safety orange, run acid lime, strength magenta-violet; one race pink (#FF2E88) reserved for the next race, today and the primary action. Heavy condensed uppercase numerals for figures, plain sans for text. Square-ish 6px plates, hairline rack rails.

STORY: Open the app, read the race bib (days to race, goal), see this week's rack filled vs dashed, compare each sport to last week, tap + to log.

FIRST VIEWPORT: Top: "WOCHE 45" + dates, settings icon. White race-bib plate: race name, date, giant "46 TAGE", pink band. Rack: rail with 7 numbered slots Mo–So, caps sized by duration, dashed outlines for past empty days, today highlighted pink. Sport rows: colour cap, name, sessions, value, delta vs last week. Pink + FAB bottom right above the tab bar (Woche, Log, Kraft, Rennen).

FORM: Swim caps and transition zone, position 6 of 7 on the grounded list; seed:6a5426ee922445e2. Raises: one accent reserved for the active week (orienteering course purple); state by line form (solid done / dashed empty); one graphic owns each screen.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
