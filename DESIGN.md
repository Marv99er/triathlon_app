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
  race-blue: "#5B7CFF"
  on-race-blue: "#111315"
  race-blue-wash: "rgba(91, 124, 255, 0.14)"
  bib-paper: "#F4F5F6"
  bib-ink: "#15171A"
  bib-ink-secondary: "#4A4F55"
  cap-black: "#000000"
  cap-letter: "#FFFFFF"
  cap-ring: "#565C62"
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
    backgroundColor: "{colors.race-blue}"
    textColor: "{colors.on-race-blue}"
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
    textColor: "{colors.race-blue}"
    typography: "{typography.body-strong}"
    height: "44px"
  primary-action:
    backgroundColor: "{colors.race-blue}"
    textColor: "{colors.on-race-blue}"
    rounded: "{rounded.sheet}"
    width: "64px"
    height: "46px"
  tab-item:
    backgroundColor: "{colors.mat}"
    textColor: "{colors.chalk-tertiary}"
    typography: "{typography.tab-label}"
    height: "52px"
  tab-item-active:
    textColor: "{colors.race-blue}"
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
    backgroundColor: "{colors.race-blue-wash}"
  race-bib:
    backgroundColor: "{colors.bib-paper}"
    textColor: "{colors.bib-ink}"
    rounded: "{rounded.bib}"
    padding: "16px 22px 0"
  race-bib-band:
    backgroundColor: "{colors.race-blue}"
    textColor: "{colors.on-race-blue}"
    padding: "9px 22px"
  rack-number:
    backgroundColor: "{colors.control}"
    textColor: "{colors.chalk-secondary}"
    rounded: "{rounded.tag}"
    height: "18px"
  rack-number-today:
    backgroundColor: "{colors.race-blue}"
    textColor: "{colors.on-race-blue}"
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

The app is a triathlon transition zone at dusk. The ground is a near-black rubber mat; content sits on slightly raised charcoal plates; the week is a bike rack with seven numbered slots; every session is a black swim cap carrying its sport's letter in white (S, R, L, K), sized by volume. The next race is a white paper start number pinned to the top of the Woche screen. One race blue marks the race, today, and whatever you can press.

It is a dense, one-handed tool, not a dashboard of grey tiles. Figures are big, heavy and condensed so they read at arm's length in a gym or outdoors; prose stays in a plain sans. Surfaces are flat. Colour carries intent only (blue = act / now / race), never decoration; which sport it is reads from the letter. The rejected reference is the stock iOS grouped-tile dashboard with system blue.

Dark is the default scene. A daylight variant keeps the same world on a light-grey mat with white plates, and a deeper blue for contrast; the caps stay black with a white letter.

**Key Characteristics:**
- Rubber-mat ground, charcoal plates, hairline rails; no shadows at rest.
- One sport mark for all four disciplines: black circle, white letter (S, R, L, K).
- One accent, race blue, for race, today and interaction.
- Barlow Condensed uppercase for figures and labels, Barlow for text, tabular numerals throughout.
- Solid = done, dashed = missed, small hollow ring = still to come.
- Portrait phone column, max 560px, thumb-zone primary action in the tab bar.

## Colors

A nearly colourless mat-and-plate neutral scale, black-and-white sport caps, and a single saturated blue for race, today and action.

### Primary
- **Race Blue** (race-blue): the bib's countdown band, today's rack number and Kraft weekday row, the center "+" primary action, active tab, text buttons, toggles, caret, focus ring and text selection. Text on it is the mat colour (on-race-blue), not white. Daylight: #2B4BD8 with white text.
- **Race Blue Wash** (race-blue-wash): 14% blue tint behind a focused form row and today's weekday row in Kraft.

### Secondary (sport caps)
- **Cap Black** (cap-black) with **Cap Letter** (cap-letter): every discipline is the same black circle with a white letter: S Schwimmen, R Rad, L Laufen, K Kraft. Built by `sportCap()` in `utils.js` for rack caps, sport rows and list badges.
- **Cap Ring** (cap-ring): a 1px inset ring that keeps the black circle visible on dark plates; transparent in daylight.

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
- **Positive** (#B4F000) and **Destructive** (#FF5A4E, daylight #C8261B): status text; destructive appears as red text on a control plate, never a red fill.

### Named Rules
**The Calm Caps Rule.** Disciplines are told apart by their letter, never by colour. No per-sport colours exist anywhere in the app: not on caps, badges, charts or the sport picker, whose selection uses race blue.

**The One Blue Rule.** Race blue is the only accent. It means the race, today, or "press here". No second accent colour exists, and system blue is never used.

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
- **Label** (600, 15px, 0.08em, uppercase, chalk-secondary): section headings such as "WOCHENÜBERSICHT", "JE DISZIPLIN", with an optional sentence-case aside at 13px on the right. The Wochenübersicht heading carries the week's total on the right as a 28px Figure, with last week's total beneath it as the aside. Tab labels 13px/600/0.06em uppercase.

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
- **Primary:** race-blue fill, mat-coloured text.
- **Secondary:** control fill, chalk text. **Destructive:** control fill, destructive-red text.
- **Text button:** blue 16px/600 without fill, 44px target; nav-bar buttons the same at 17px, "quiet" variant in chalk-secondary, disabled at 40% opacity.
- **Focus:** 2px blue outline, 2px offset, on every focusable element.

### Primary action (tab-bar "+")
A 64x46px blue block with 12px corners, centred in the tab bar between Log and Kraft. It is the only "+" in the app: each screen registers its own action and label into it (add workout, start strength session, add race, upload plan). Press scales to 0.96. It never floats over content.

### Cards / Plates
- **Corner Style:** 6px. **Background:** plate. **Shadow:** none. **Border:** none; rows inside are separated by 1px hairlines. **Padding:** 16px (exercise cards 14px).

### Reordering exercises
Every exercise card carries a 44px grip (control fill, chalk dots) left of its name. Dragging the grip or holding the card for 400ms lifts it: the screen switches to a compact list of all exercises on the mat, the lifted row is a raised plate with Float shadow and a 2px blue outline, and releasing drops it. The compact list exists because cards are often nearly screen-height. Holding inside the field being typed in stays a caret gesture. The card's menu keeps "Nach oben/unten verschieben" as the non-gesture route.

### Lists and rows
Rows 56px min, 12px 16px padding, 12px gap: optional leading badge or cap, title 16/600, subtitle 14px secondary, trailing value and chevron in tertiary. Pressed state fills with control.

### Inputs / Fields
- **Style:** iOS-settings style rows inside a plate: label left, borderless value right-aligned, 16px, unit suffix in secondary. Inside a card the group switches to the control tone so fields stay visible. Set inputs in Kraft are filled control boxes (6px, 44px).
- **Focus:** the whole row takes the blue wash; blue caret. No input outline.
- **Selects:** custom chevron, no native chrome. **Toggle:** 51x31 pill, blue when on. **Check:** 28px square (6px corners) with a 2px chalk-tertiary border, blue fill and mat-coloured tick when set; the whole row is the target. Used for "Geplantes Rennen".
- **Hint:** 14px chalk-secondary line under a group. Whenever Sichern is blocked by something non-obvious, a hint says why.

### Navigation
Nav bar: mat background with a bottom hairline, condensed uppercase title left, subtitle (dates) and icon buttons right. Tab bar: mat background, top hairline, 24px stroked icons over 13px condensed uppercase labels; inactive chalk-tertiary, active race blue.

### Sheets, menus, dialogs
Sheets slide up from the bottom (0.32s, `cubic-bezier(0.16, 1, 0.3, 1)`), 12px top corners, 12px below the safe area, nav bar with text buttons left and right. Action menus and popovers are raised plates with Float shadow, 52px items separated by hairlines, destructive items in red. Confirm dialogs are bottom-anchored grouped buttons (12px corners, 56px items). Toast: raised plate with hairline border, fades 0.2s. All transitions are disabled under `prefers-reduced-motion`.

### Race bib (signature)
White paper plate pinned to the top of Woche (and Rennen): uppercase race name and date in a 17px condensed header, the 96px days-to-race display figure with its unit, and a full-bleed blue band beneath with goal time and weeks/days. Empty and static variants exist.

### Wechselzone rack (signature)
A plate holding a 7-slot grid crossed by a 3px rail. Each slot: rack-number tag (1-7, blue for today), a 2px hook, the caps hanging below, the condensed day abbreviation underneath. Caps are black circles 24-44px with a white letter at 56% of their size, sized by duration (strength by set count). Past day without session: 18px dashed ring in chalk-tertiary. Future day: 10px hollow ring in rail.

### Sport line
Per-sport row under "JE DISZIPLIN": 28px cap (solid black if trained this week; otherwise a dashed chalk-tertiary ring with the letter in chalk-tertiary), name and session meta left, 28px condensed figure right with a comparison to last week to the same weekday beneath. Idle figures in chalk-tertiary.

### Race result
Plate with name/date header, 56px total time, meta line, and a 5-cell split grid (Swim, T1, Bike, T2, Run) with condensed split labels; missing splits in tertiary.

## Do's and Don'ts

### Do:
- **Do** mark state by line form: solid filled cap = done, dashed ring = nothing logged, small hollow rail ring = still ahead.
- **Do** use race blue for the race, today, and the thing to press, with mat-coloured text on it in dark mode.
- **Do** set every figure in Barlow Condensed with tabular numerals, and keep body text and inputs at 16px.
- **Do** keep touch targets at 44px or more and route each screen's main action through the single tab-bar "+".
- **Do** use the daylight variant's deeper blue in light mode.
- **Do** separate rows with 1px hairlines inside a plate rather than spacing plates apart.

### Don't:
- **Don't** build the iOS grey-tile dashboard or use system blue.
- **Don't** bring back per-sport colours; the letter tells the disciplines apart.
- **Don't** add a second accent colour or a blue gradient.
- **Don't** put shadows on resting plates, cards, the rack or the bib.
- **Don't** add a floating action button over content; the primary action lives in the tab bar.
- **Don't** block browser zoom (the viewport allows scaling; keep it that way).
- **Don't** treat the Google Fonts dependency as settled: Barlow and Barlow Condensed are loaded from fonts.googleapis.com and runtime-cached by the service worker; self-hosting them is an open decision for the owner.
