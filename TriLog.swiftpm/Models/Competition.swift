import Foundation
import SwiftData

@Model
final class Competition {
    var id: UUID
    var name: String
    var date: Date
    var isTriathlon: Bool
    private var sportTypeRaw: String?

    /// Nur bei Einzeldisziplin relevant.
    var distanceKm: Double?

    var totalDurationSeconds: Int

    /// Nur bei Triathlon relevant, jeweils optional.
    var swimDurationSeconds: Int?
    var t1DurationSeconds: Int?
    var bikeDurationSeconds: Int?
    var t2DurationSeconds: Int?
    var runDurationSeconds: Int?

    var placement: Int?
    var notes: String?

    var sportType: SportType? {
        get { sportTypeRaw.flatMap { SportType(rawValue: $0) } }
        set { sportTypeRaw = newValue?.rawValue }
    }

    var formattedTotalTime: String {
        Self.formatDuration(totalDurationSeconds)
    }

    static func formatDuration(_ totalSeconds: Int) -> String {
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        let seconds = totalSeconds % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%d:%02d", minutes, seconds)
        }
    }

    init(
        name: String,
        date: Date,
        isTriathlon: Bool,
        totalDurationSeconds: Int
    ) {
        self.id = UUID()
        self.name = name
        self.date = date
        self.isTriathlon = isTriathlon
        self.totalDurationSeconds = totalDurationSeconds
    }
}
