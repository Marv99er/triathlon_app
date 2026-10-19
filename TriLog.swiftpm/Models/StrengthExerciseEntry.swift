import Foundation
import SwiftData

/// Ein einzelner Satz einer Übung: Gewicht (optional, z. B. bei Eigengewicht) und Wiederholungen.
struct ExerciseSet: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var weightKg: Double?
    var reps: Int
}

@Model
final class StrengthExerciseEntry {
    var id: UUID
    var name: String
    var notes: String?
    var order: Int
    var sets: [ExerciseSet]
    var workout: Workout?

    init(
        name: String,
        notes: String? = nil,
        order: Int = 0,
        sets: [ExerciseSet] = []
    ) {
        self.id = UUID()
        self.name = name
        self.notes = notes
        self.order = order
        self.sets = sets
    }

    /// Kompakte Zusammenfassung aller Sätze, z. B. "10×40kg, 8×42,5kg, 6×45kg".
    var summary: String {
        sets.map { set in
            if let weight = set.weightKg {
                return "\(set.reps)×\(weight.formatted(.number.precision(.fractionLength(0...1))))kg"
            } else {
                return "\(set.reps)×"
            }
        }.joined(separator: ", ")
    }
}
