import SwiftUI
import SwiftData

/// Zeigt für einen Monat, an welchem Tag welches Krafttraining (Routine) gemacht wurde.
struct StrengthMonthOverviewView: View {
    @Query(sort: \Workout.date, order: .reverse) private var allWorkouts: [Workout]
    @State private var monthOffset = 0

    private var displayedMonth: Date {
        Calendar.current.date(byAdding: .month, value: monthOffset, to: .now) ?? .now
    }

    private var monthInterval: DateInterval {
        Calendar.current.dateInterval(of: .month, for: displayedMonth) ?? DateInterval(start: .now, duration: 0)
    }

    private var sessionsInMonth: [Workout] {
        allWorkouts.filter { $0.sportType == .strength && monthInterval.contains($0.date) }
    }

    var body: some View {
        List {
            if sessionsInMonth.isEmpty {
                Text("Keine Krafttrainings in diesem Monat.")
                    .foregroundStyle(.secondary)
            } else {
                ForEach(sessionsInMonth) { workout in
                    NavigationLink {
                        WorkoutDetailView(workout: workout)
                    } label: {
                        row(for: workout)
                    }
                }
            }
        }
        .navigationTitle(displayedMonth.formatted(.dateTime.month(.wide).year()))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                HStack(spacing: 20) {
                    Button {
                        monthOffset -= 1
                    } label: {
                        Image(systemName: "chevron.left")
                    }
                    Button {
                        monthOffset += 1
                    } label: {
                        Image(systemName: "chevron.right")
                    }
                    .disabled(monthOffset >= 0)
                }
            }
        }
    }

    private func row(for workout: Workout) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(workout.routineName ?? "Krafttraining")
                .font(.subheadline.weight(.semibold))
            Text(workout.date.formatted(date: .abbreviated, time: .omitted) + " · " + workout.strengthExercises.map(\.name).joined(separator: ", "))
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .padding(.vertical, 2)
    }
}

#Preview {
    NavigationStack {
        StrengthMonthOverviewView()
            .modelContainer(for: [Workout.self, StrengthExerciseEntry.self], inMemory: true)
    }
}
