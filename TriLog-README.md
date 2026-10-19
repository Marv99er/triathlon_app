# TriLog

Private Trainings-App für Triathlon (Schwimmen, Radfahren, Laufen) und Kraftsport. Manuelle Eingabe, eigener Trainingsplan, alle Daten bleiben lokal auf dem iPhone (SwiftData, kein iCloud-Sync).

## Wichtig: Projektort geändert

Das Projekt liegt jetzt unter `~/TriLog.swiftpm` (direkt im Home-Ordner), **nicht** mehr unter `Dokumente/Claude Code/Triathleten App`. Grund: macOS hat den Zugriff auf den Dokumente-Ordner für diese Sitzung blockiert (Unternehmens-Sicherheitsrichtlinie). Der Code ist inhaltlich identisch.

## Öffnen & starten

1. Im Finder auf `TriLog.swiftpm` doppelklicken (liegt direkt in deinem Home-Ordner) — Xcode erkennt den Ordner automatisch als App-Projekt.
2. Oben in Xcode einen iPhone-Simulator auswählen und mit ⌘R starten.
3. Für den Test auf dem echten iPhone: Gerät anschließen, als Ziel auswählen, ggf. einmalig "Vertrauen" für den Entwickler auf dem iPhone unter Einstellungen → Allgemein → VPN & Geräteverwaltung bestätigen.

## Struktur

- `Models/` – SwiftData-Modelle: `SportType`, `Workout`, `StrengthExerciseEntry`, `PlannedWorkout`
- `Views/Dashboard` – Übersicht mit Wochen-Kennzahlen, nächsten Einheiten, letzten Trainings
- `Views/Plan` – Trainingsplan anlegen/bearbeiten/löschen, als erledigt markieren
- `Views/Log` – Trainingsverlauf, Training eintragen/bearbeiten, Detailansicht
- `Views/Components` – wiederverwendbare UI-Bausteine (Sportart-Badge, Kennzahl-Kachel, Listenzeilen)

## Noch nicht enthalten (bewusst für später)

- Garmin-/Apple-Health-Import (aktuell alles manuell)
- Statistik-Charts/Trends über einen längeren Zeitraum
- Erinnerungen/Notifications für geplante Einheiten
