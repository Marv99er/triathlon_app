/// Hilfsstruktur für die Eingabe von Zeiten (Stunden/Minuten/Sekunden) in Formularen.
struct TimeComponents {
    var hours: Int = 0
    var minutes: Int = 0
    var seconds: Int = 0

    var totalSeconds: Int {
        hours * 3600 + minutes * 60 + seconds
    }

    var isZero: Bool {
        totalSeconds == 0
    }

    static func from(seconds: Int?) -> TimeComponents {
        guard let seconds, seconds > 0 else { return TimeComponents() }
        return TimeComponents(hours: seconds / 3600, minutes: (seconds % 3600) / 60, seconds: seconds % 60)
    }
}
