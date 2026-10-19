import Foundation
import SwiftData

@Model
final class Workout {
    var id: UUID
    var date: Date
    private var sportTypeRaw: String
    var durationSeconds: Int
    var distanceKm: Double?
    var avgHeartRate: Int?
    var maxHeartRate: Int?
    /// Subjektive Anstrengung (RPE), 1 (sehr leicht) bis 10 (maximal)
    var rpe: Int?
    var notes: String?
    /// Name der Kraft-Routine (z. B. "Oberkörper A"), falls dieses Training darauf basiert.
    var routineName: String?
    /// Nur bei Krafttraining relevant.
    var bodyWeightKg: Double?

    @Relationship(deleteRule: .cascade, inverse: \StrengthExerciseEntry.workout)
    var strengthExercises: [StrengthExerciseEntry] = []

    var sportType: SportType {
        get { SportType(rawValue: sportTypeRaw) ?? .run }
        set { sportTypeRaw = newValue.rawValue }
    }

    /// Anzeige der Dauer, z. B. "45 min" oder "45:30 min" bei Sekunden ungleich null.
    var formattedDuration: String {
        let minutes = durationSeconds / 60
        let seconds = durationSeconds % 60
        return seconds == 0 ? "\(minutes) min" : String(format: "%d:%02d min", minutes, seconds)
    }

    /// Durchschnittliches Tempo: Laufen in min/km, Schwimmen in min/100m, Rad als km/h.
    var averagePace: String? {
        guard sportType.tracksDistance, let distanceKm, distanceKm > 0, durationSeconds > 0 else { return nil }
        let totalSeconds = Double(durationSeconds)

        switch sportType {
        case .run:
            return Self.formatPace(totalSeconds / distanceKm) + "/km"
        case .swim:
            return Self.formatPace(totalSeconds / (distanceKm * 10)) + "/100m"
        case .bike:
            let kmh = distanceKm / (totalSeconds / 3600)
            return kmh.formatted(.number.precision(.fractionLength(0...1))) + " km/h"
        case .strength:
            return nil
        }
    }

    private static func formatPace(_ secondsPerUnit: Double) -> String {
        let minutes = Int(secondsPerUnit) / 60
        let seconds = Int(secondsPerUnit) % 60
        return String(format: "%d:%02d min", minutes, seconds)
    }

    init(
        date: Date = .now,
        sportType: SportType,
        durationSeconds: Int,
        distanceKm: Double? = nil,
        avgHeartRate: Int? = nil,
        maxHeartRate: Int? = nil,
        rpe: Int? = nil,
        notes: String? = nil
    ) {
        self.id = UUID()
        self.date = date
        self.sportTypeRaw = sportType.rawValue
        self.durationSeconds = durationSeconds
        self.distanceKm = distanceKm
        self.avgHeartRate = avgHeartRate
        self.maxHeartRate = maxHeartRate
        self.rpe = rpe
        self.notes = notes
    }
}
