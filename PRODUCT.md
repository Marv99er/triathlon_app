# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(PWA in `docs/`, installed to the iPhone home screen, portrait only. A separate SwiftUI app exists in `TriLog.swiftpm/` but is not the redesign target.)

## Users

One user: the owner, an age-group triathlete who also does strength training. Not shared with anyone. The app is opened in three situations:

- **After a workout**: check that the Garmin sync picked up the session, add notes/RPE, or log it manually.
- **During strength training** in the gym: log sets live, look up last session's weights.
- **Weekly planning / review**: see how the week went and what is coming up.

## Product Purpose

Show whether training is on track for the next race. Success: opening the app answers "am I on course for my next competition?" at a glance (volume per sport, trend, countdown), while logging stays fast enough to do one-handed right after a session or between sets.

## Positioning

A private, local-first triathlon logbook that combines automatically synced endurance data with hand-logged strength training and race results, oriented around the athlete's own next race rather than generic fitness metrics.

## Operating Context

- Endurance sessions (swim, bike, run) arrive mostly automatically from Garmin via intervals.icu sync; manual entry and Garmin TCX import are fallbacks.
- Strength sessions are logged manually, usually live in the gym, from weekday-assigned routines.
- The training plan comes from a coach/program and is stored as a photo or PDF; it is a reference, not structured data.
- Competitions are entered with total time, triathlon splits (swim, T1, bike, T2, run) and placement.

## Capabilities and Constraints

- Data stays local in IndexedDB on the device; no account, no cloud backend. Backup/export exists in settings.
- Sports: swim, bike, run, strength. Language: German UI.
- Vanilla JS + CSS, no framework, served as static files with a service worker.
- Undecided: whether Plan and Kraft remain separate primary tabs.

## Evidence on Hand

Real training data exists only on the user's phone. No testimonials, users, or metrics beyond that; do not fabricate them.

## Product Principles

1. The next race is the north star: progress toward it is the first thing shown.
2. Synced data needs no work; the app's effort goes into reviewing it, not re-entering it.
3. Logging must work one-handed, mid-session, in seconds.
4. One interaction model across all sections.

## Accessibility & Inclusion

Used outdoors and in the gym, often tired or sweaty: readable contrast (WCAG AA), large touch targets, browser zoom must not be blocked.
