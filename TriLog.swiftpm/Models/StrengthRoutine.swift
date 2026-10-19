import Foundation
import SwiftData

/// Eine wiederverwendbare Kraft-Trainingsvorlage, z. B. "Oberkörper A", mit fester Übungsliste
/// und optional einem festen Wochentag (1 = Montag ... 7 = Sonntag).
@Model
final class StrengthRoutine {
    var id: UUID
    var name: String
    var exerciseNames: [String]
    var assignedWeekday: Int?

    init(
        name: String,
        exerciseNames: [String] = [],
        assignedWeekday: Int? = nil
    ) {
        self.id = UUID()
        self.name = name
        self.exerciseNames = exerciseNames
        self.assignedWeekday = assignedWeekday
    }
}
