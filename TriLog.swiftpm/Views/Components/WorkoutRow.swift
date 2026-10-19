import SwiftUI

/// Zeile für ein absolviertes Training, verwendet im Dashboard und im Trainingsverlauf.
struct WorkoutRow: View {
    let workout: Workout

    private var dateText: String {
        workout.date.formatted(.dateTime.day().month(.abbreviated))
    }

    private var metricsText: String {
        var parts: [String] = [workout.formattedDuration]
        if workout.sportType.tracksDistance, let distance = workout.distanceKm {
            parts.insert(distance.formatted(.number.precision(.fractionLength(0...2))) + " km", at: 0)
        } else if workout.sportType == .strength && !workout.strengthExercises.isEmpty {
            parts.append("\(workout.strengthExercises.count) Übungen")
        }
        if let averagePace = workout.averagePace {
            parts.append(averagePace)
        }
        return parts.joined(separator: " · ")
    }

    var body: some View {
        HStack(spacing: 12) {
            SportBadge(sportType: workout.sportType)

            VStack(alignment: .leading, spacing: 3) {
                Text(workout.routineName ?? workout.sportType.displayName)
                    .font(.subheadline.weight(.semibold))
                Text(metricsText)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                Text(dateText)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                if let rpe = workout.rpe {
                    Text("RPE \(rpe)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
