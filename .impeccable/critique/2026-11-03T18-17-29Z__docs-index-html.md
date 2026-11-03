---
target: TriLog PWA
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\gehrl\\OneDrive\\Claude\\Code\\Eigene Apps_PWA\\triathlon_app\\docs\\index.html"
target_fingerprint: "sha256:3ff65c19e51b8ef8706fa80b4545d67b56d99724deeec3e259c9b824b791e282"
target_path: "C:\\Users\\gehrl\\OneDrive\\Claude\\Code\\Eigene Apps_PWA\\triathlon_app\\docs\\index.html"
timestamp: 2026-11-03T18-17-29Z
slug: docs-index-html
---
Method: dual-agent (A: design review · B: detector + browser measurements; overlay failed — live-server truncates detect.js)

## Heuristics (21/40, Acceptable)
1 Status 2 · 2 Real world 2 · 3 Control 3 · 4 Consistency 2 · 5 Error prevention 2 · 6 Recognition 2 · 7 Efficiency 2 · 8 Minimalism 2 · 9 Recovery 2 · 10 Help 2

## Design specificity
Generic iOS clone: system blue accent (#0A84FF, identical to swim tint), SF stack, grouped lists, centered 17px titles. Sport tints decorative only. Detector CLI: 0 findings (JS-rendered DOM, limited coverage).

## Priority issues
- [P0] Wettkämpfe: future race shown as "Letzter Wettkampf" with goal time as result (competitions.js:34,49). Fix: split "Nächster Wettkampf" (countdown, Ziel) vs "Ergebnisse"; countdown on Übersicht.
- [P1] Übersicht lacks hierarchy/meaning: Gesamtzeit hero in swim blue, 4 equal tiles with "–", mixed units, no comparison. Fix: week vs last week, 7-day sport strip, sport rows with proportional bars, race countdown, new accent color.
- [P1] Inconsistent interaction model: row tap = detail (Log) / edit form (Wettkämpfe) / routine editor (Kraft); + missing on Kraft, replaced on Plan. Fix: one rule (tap → detail, edit inside), today's routine starts workout.
- [P2] Strength form friction: last values far from inputs, end time defaults now+45, per-set kebabs 28px, .btn-plain browser border (styles.css:268), right-aligned note.
- [P2] Contrast & a11y: RPE text 2.84:1 (11px), tab labels 3.51:1 (10px), Training-starten 3.82:1 at 102x28, white on #0A84FF 3.65:1; icon buttons 28–30px without aria-label; maximum-scale=1; no focus styles.

## Personas
Casey: all primary actions top-right, small targets, wrong strength end time, two-step + menu. Jordan: RPE/Wdh./T1/T2 unexplained, no hint for intervals.icu key, invisible API-key input. Sam: contrast fails above, unlabeled icon buttons, zoom blocked.

## Minor
Selects without chevron; time fields unpadded "5 : 30 : 0"; swim distance in km; "8×0kg" for bodyweight; month overview empty title + blank load; competition icon always orange; Plan as primary tab is a dead end; inline styles drift (22px vs 17px vs unused 34px titles); duplicate title in workout detail; settings Abbrechen+Fertig.

## Questions
Next race as north star on Übersicht? Kraft as own tab or 4th sport in one log? Design around a coach's week grid instead of iOS defaults?
