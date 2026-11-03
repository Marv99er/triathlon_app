---
name: TriLog
description: Private triathlon logbook PWA; the week as a transition zone, sessions as swim caps.
colors:
  mat: "#111315"
  plate: "#1B1E21"
  plate-raised: "#24282C"
  control: "#2A2E33"
  hairline: "#2E3338"
  rail: "#3A4046"
  chalk: "#F2F1EC"
  chalk-secondary: "#A3A9AF"
  chalk-tertiary: "#80878E"
  race-pink: "#FF2E88"
  on-race-pink: "#111315"
  race-pink-wash: "rgba(255, 46, 136, 0.14)"
  bib-paper: "#F4F5F6"
  bib-ink: "#15171A"
  bib-ink-secondary: "#4A4F55"
  cap-swim: "#1FA2FF"
  cap-bike: "#FF7A1A"
  cap-run: "#B4F000"
  cap-strength: "#D45CFF"
  positive: "#B4F000"
  destructive: "#FF5A4E"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "96px"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "56px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    letterSpacing: "0.01em"
  figure:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  body:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  body-strong:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  meta:
    fontFamily: "Barlow, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.08em"
  tab-label:
    fontFamily: "Barlow Condensed, Arial Narrow, Roboto Condensed, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  tag: "3px"
  bib: "4px"
  plate: "6px"
  sheet: "12px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.race-pink}"
    textColor: "{colors.on-race-pink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.plate}"
    padding: "13px 18px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.control}"
    textColor: "{colors.chalk}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.plate}"
    padding: "13px 18px"
    height: "48px"
  button-destructive:
    backgroundColor: "{colors.control}"
    textColor: "{colors.destructive}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.plate}"
    padding: "13px 18px"
    height: "48px"
  button-text:
    textColor: "{colors.race-pink}"
    typography: "{typography.body-strong}"
    height: "44px"
  primary-action:
    backgroundColor: "{colors.race-pink}"
    textColor: "{colors.on-race-pink}"
    rounded: "{rounded.sheet}"
    width: "64px"
    height: "46px"
  tab-item:
    backgroundColor: "{colors.mat}"
    textColor: "{colors.chalk-tertiary}"
    typography: "{typography.tab-label}"
    height: "52px"
  tab-item-active:
    textColor: "{colors.race-pink}"
  plate:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.plate}"
    padding: "16px"
  list-row:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.chalk}"
    padding: "12px 16px"
    height: "56px"
  form-row:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.chalk}"
    typography: "{typography.body}"
    padding: "12px 16px"
    height: "52px"
  form-row-focus:
    backgroundColor: "{colors.race-pink-wash}"
  race-bib:
    backgroundColor: "{colors.bib-paper}"
    textColor: "{colors.bib-ink}"
    rounded: "{rounded.bib}"
    padding: "16px 22px 0"
  race-bib-band:
    backgroundColor: "{colors.race-pink}"
    textColor: "{colors.on-race-pink}"
    padding: "9px 22px"
  rack-number:
    backgroundColor: "{colors.control}"
    textColor: "{colors.chalk-secondary}"
    rounded: "{rounded.tag}"
    height: "18px"
  rack-number-today:
    backgroundColor: "{colors.race-pink}"
    textColor: "{colors.on-race-pink}"
  sheet:
    backgroundColor: "{colors.mat}"
    rounded: "{rounded.sheet}"
  menu:
    backgroundColor: "{colors.plate-raised}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.plate}"
---

# Design System: TriLog

## Overview

**Creative North Star: "Wechselzone"**

The app is a triathlon transition zone at dusk. The ground is a near-black rubber mat; content sits on slightly raised charcoal plates; the week is a bike rack with seven numbered slots; every session is a latex swim cap in its sport's colour, sized by volume. The next race is a white paper start number pinned to the top of the Woche screen. One race pink marks the race, today, and whatever you can press.

It is a dense, one-handed tool, not a dashboard of grey tiles. Figures are big, heavy and condensed so they read at arm's length in a gym or outdoors; prose stays in a plain sans. Surfaces are flat. Colour carries data (which sport) and intent (pink = act / now / race), never decoration. The rejected reference is the stock iOS grouped-tile dashboard with system blue.

Dark is the default scene. A daylight variant keeps the same world on a light-grey mat with white plates, a deeper pink, and darker cap colours for contrast.

**Key Characteristics:**
- Rubber-mat ground, charcoal plates, hairline rails; no shadows at rest.
- Four sport cap colours used only as data marks.
- One accent, race pink, for race, today and interaction.
- Barlow Condensed uppercase for figures and labels, Barlow for text, tabular numerals throughout.
- Solid = done, dashed = missed, small hollow ring = still to come.
- Portrait phone column, max 560px, thumb-zone primary action in the tab bar.

## Colors

A nearly colourless mat-and-plate neutral scale, four saturated cap colours that only ever mean a sport, and a single hot pink for race, today and action.

### Primary
- **Race Pink** (race-pink): the bib's countdown band, today's rack number and Kraft weekday row, the center "+" primary action, active tab, text buttons, toggles, caret, focus ring and text selection. Text on it is the mat colour (on-race-pink), not white. Daylight: #D4106A with white text.
- **Race Pink Wash** (race-pink-wash): 14% pink tint behind a focused form row and today's weekday row in Kraft.

### Secondary (sport caps, data only)
- **Swim Electric Blue** (cap-swim), **Bike Safety Orange** (cap-bike), **Run Acid Lime** (cap-run), **Strength Magenta-Violet** (cap-strength). Referenced from JS through `var(--swim)` etc. They fill rack caps and sport-row dots, outline empty-sport dots (dashed), tint sport badges at 18% via `color-mix`, and border the selected sport-picker tile. Daylight values: #0070D1, #C95200, #4C8A00, #A436D1.

### Tertiary
- **Bib Paper** (bib-paper) with **Bib Ink** (bib-ink, bib-ink-secondary): only inside the race bib plate. The bib is the one light object on the dark mat.

### Neutral
- **Rubber Mat** (mat): page, nav bar, tab bar and sheet ground.
- **Plate** (plate): cards, lists, form groups, the rack, results.
- **Raised Plate** (plate-raised): floating menus, toast, confirm dialog.
- **Control** (control): secondary buttons, inputs inside cards, rack-number tags, pressed rows.
- **Hairline** (hairline): 1px row separators, nav and tab borders, split dividers.
- **Rail** (rail): the rack bar and hooks, future-day rings, scrollbar thumb.
- **Chalk / Chalk Secondary / Chalk Tertiary**: primary text, meta text, inactive tabs and placeholders.
- **Positive** (#B4F000, same as run lime) and **Destructive** (#FF5A4E, daylight #C8261B): status text; destructive appears as red text on a control plate, never a red fill.

### Named Rules
**The Caps Are Data Rule.** Sport colours appear only on marks that stand for a sport (caps, dots, badges, picker selection). Never on chrome, buttons or headings.

**The One Pink Rule.** Race pink is the only accent. It means the race, today, or "press here". No second accent colour exists, and system blue is never used.

## Typography

**Display / Figure Font:** Barlow Condensed 600/700/800 (fallback Arial Narrow, Roboto Condensed)
**Body Font:** Barlow 400/500/600 (fallback -apple-system, Segoe UI, Roboto)

**Character:** A race-number condensed grotesk for everything you count or scan, paired with its own plain-width sibling for sentences. Both loaded from Google Fonts (see Do's and Don'ts on the open self-hosting item).

### Hierarchy
- **Display** (800, 96px, 0.86, -0.02em): the bib's days-to-race number only; unit ("TAGE") beside it at 24px/800 uppercase.
- **Headline** (800, 56px, 1): race result total time.
- **Title** (700, 26px, uppercase, 0.01em): screen title in the nav bar ("WOCHE 45"); 20px centered inside sheets.
- **Figure** (700, 28px, 1, tabular): per-sport weekly value; splits use 20px/700; bib header 17px/700 uppercase.
- **Body** (400 / 600, 16px): row titles at 600, inputs and menu items at 400. Inputs never go below 16px.
- **Meta** (400, 13-15px): secondary row text, comparisons with last week, empty-state copy (max 280px wide).
- **Label** (600, 15px, 0.08em, uppercase, chalk-secondary): section headings such as "WECHSELZONE", "JE DISZIPLIN", with an optional sentence-case aside at 13px on the right. Tab labels 13px/600/0.06em uppercase.

### Named Rules
**The Condensed Figures Rule.** Every number, day abbreviation and uppercase label is Barlow Condensed with tabular numerals (`.figure` utility); every sentence is Barlow, sentence case.

## Layout

A single portrait column, max 560px, centred, full dynamic viewport height (`100dvh`) with safe-area padding top and bottom. Sticky nav bar on top (min 52px), fixed tab bar at the bottom: Woche, Log, [+], Kraft, Rennen. Plan is not a tab; it opens from Woche and keeps Woche highlighted.

Page content: 16px outer padding, 24px gap between blocks; inside plates 12-16px. Section labels sit 4px in from the plate edge with 8px below. Rhythm steps: 4 / 8 / 12 / 16 / 24 / 32 / 48. The rack is a 7-column grid; race splits a 5-column grid with hairline dividers. Touch targets are at least 44px; list rows 56px, sport rows 60px, buttons 48px. No breakpoints: the column simply caps at 560px.

## Elevation & Depth

Flat by default. Depth comes from tonal steps: mat (page) to plate (content) to raised plate (floating). Shadows appear only on things that float above content and must separate from it.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 8px 28px rgba(0,0,0,0.35)`): kebab popover and action menu.
- **Knob** (`box-shadow: 0 1px 3px rgba(0,0,0,0.3)`): the toggle thumb.
- **Scrim** (`rgba(0,0,0,0.55)` backdrop): behind sheets.

### Named Rules
**The Flat Plates Rule.** Cards, lists, the rack and the bib carry no shadow. If something needs to read as "above", it uses the raised plate tone, and a shadow only when it floats over other content.

## Shapes

Square-ish plates (6px) everywhere; the paper bib is slightly sharper (4px) with two punched safety-pin holes in its top corners (7px circles in the mat colour). Small tags (rack numbers, day chip) 3px. Sheets, the confirm dialog and the tab-bar primary action use a softer 12px. Circles are reserved for meaning: caps, sport badges, set-index rings, toggles. Lines are 1px hairlines, the rack rail 3px with 2px hooks.

## Components

### Buttons
- **Shape:** gently squared (6px), 48px tall, 13px 18px padding, 16px/600 text.
- **Primary:** race-pink fill, mat-coloured text.
- **Secondary:** control fill, chalk text. **Destructive:** control fill, destructive-red text.
- **Text button:** pink 16px/600 without fill, 44px target; nav-bar buttons the same at 17px, "quiet" variant in chalk-secondary, disabled at 40% opacity.
- **Focus:** 2px pink outline, 2px offset, on every focusable element.

### Primary action (tab-bar "+")
A 64x46px pink block with 12px corners, centred in the tab bar between Log and Kraft. It is the only "+" in the app: each screen registers its own action and label into it (add workout, start strength session, add race, upload plan). Press scales to 0.96. It never floats over content.

### Cards / Plates
- **Corner Style:** 6px. **Background:** plate. **Shadow:** none. **Border:** none; rows inside are separated by 1px hairlines. **Padding:** 16px (exercise cards 14px).

### Lists and rows
Rows 56px min, 12px 16px padding, 12px gap: optional leading badge or cap, title 16/600, subtitle 14px secondary, trailing value and chevron in tertiary. Pressed state fills with control.

### Inputs / Fields
- **Style:** iOS-settings style rows inside a plate: label left, borderless value right-aligned, 16px, unit suffix in secondary. Inside a card the group switches to the control tone so fields stay visible. Set inputs in Kraft are filled control boxes (6px, 44px).
- **Focus:** the whole row takes the pink wash; pink caret. No input outline.
- **Selects:** custom chevron, no native chrome. **Toggle:** 51x31 pill, pink when on.

### Navigation
Nav bar: mat background with a bottom hairline, condensed uppercase title left, subtitle (dates) and icon buttons right. Tab bar: mat background, top hairline, 24px stroked icons over 13px condensed uppercase labels; inactive chalk-tertiary, active race pink.

### Sheets, menus, dialogs
Sheets slide up from the bottom (0.32s, `cubic-bezier(0.16, 1, 0.3, 1)`), 12px top corners, 12px below the safe area, nav bar with text buttons left and right. Action menus and popovers are raised plates with Float shadow, 52px items separated by hairlines, destructive items in red. Confirm dialogs are bottom-anchored grouped buttons (12px corners, 56px items). Toast: raised plate with hairline border, fades 0.2s. All transitions are disabled under `prefers-reduced-motion`.

### Race bib (signature)
White paper plate pinned to the top of Woche (and Rennen): uppercase race name and date in a 17px condensed header, the 96px days-to-race display figure with its unit, and a full-bleed pink band beneath with goal time and weeks/days. Empty and static variants exist.

### Wechselzone rack (signature)
A plate holding a 7-slot grid crossed by a 3px rail. Each slot: rack-number tag (1-7, pink for today), a 2px hook, the caps hanging below, the condensed day abbreviation underneath. Caps are circles 16-44px, sized by duration (strength by set count). Past day without session: 18px dashed ring in chalk-tertiary. Future day: 10px hollow ring in rail.

### Sport line
Per-sport row under "JE DISZIPLIN": 14px cap (solid if trained this week, dashed outline in the sport colour if not), name and session meta left, 28px condensed figure right with a comparison to last week to the same weekday beneath. Idle figures in chalk-tertiary.

### Race result
Plate with name/date header, 56px total time, meta line, and a 5-cell split grid (Swim, T1, Bike, T2, Run) with 8px caps beside the condensed split labels; missing splits in tertiary.

## Do's and Don'ts

### Do:
- **Do** mark state by line form: solid filled cap = done, dashed ring = nothing logged, small hollow rail ring = still ahead.
- **Do** use race pink for the race, today, and the thing to press, with mat-coloured text on it in dark mode.
- **Do** set every figure in Barlow Condensed with tabular numerals, and keep body text and inputs at 16px.
- **Do** keep touch targets at 44px or more and route each screen's main action through the single tab-bar "+".
- **Do** use the daylight variant's darker cap and pink values in light mode; never reuse the dark-mode cap colours on white.
- **Do** separate rows with 1px hairlines inside a plate rather than spacing plates apart.

### Don't:
- **Don't** build the iOS grey-tile dashboard or use system blue.
- **Don't** colour buttons, headings or chrome with a sport colour.
- **Don't** add a second accent colour or a pink gradient.
- **Don't** put shadows on resting plates, cards, the rack or the bib.
- **Don't** add a floating action button over content; the primary action lives in the tab bar.
- **Don't** block browser zoom (the viewport allows scaling; keep it that way).
- **Don't** treat the Google Fonts dependency as settled: Barlow and Barlow Condensed are loaded from fonts.googleapis.com and runtime-cached by the service worker; self-hosting them is an open decision for the owner.
