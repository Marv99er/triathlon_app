import SwiftUI
import SwiftData

struct WorkoutHistoryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Workout.date, order: .reverse) private var workouts: [Workout]

    @State private var showsAddSheet = false

    private var groupedByMonth: [(month: String, workouts: [Workout])] {
        let groups = Dictionary(grouping: workouts) { workout in
            workout.date.formatted(.dateTime.month(.wide).year())
        }
        return groups
            .sorted { lhs, rhs in
                (lhs.value.first?.date ?? .distantPast) > (rhs.value.first?.date ?? .distantPast)
            }
            .map { (month: $0.key, workouts: $0.value) }
    }

    var body: some View {
        NavigationStack {
            Group {
                if workouts.isEmpty {
                    EmptyStateView(
                        icon: "list.bullet.clipboard",
                        title: "Noch keine Trainings",
                        message: "Trage dein erstes Training ein, um deinen Verlauf zu sehen.",
                        actionTitle: "Training hinzufügen",
                        action: { showsAddSheet = true }
                    )
                } else {
                    List {
                        ForEach(groupedByMonth, id: \.month) { group in
                            Section(group.month) {
                                ForEach(group.workouts) { workout in
                                    NavigationLink {
                                        WorkoutDetailView(workout: workout)
                                    } label: {
                                        WorkoutRow(workout: workout)
                                    }
                                }
                                .onDelete { offsets in
                                    delete(workouts: offsets.map { group.workouts[$0] })
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Trainingslog")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    AddWorkoutMenuButton()
                }
            }
            .sheet(isPresented: $showsAddSheet) {
                WorkoutFormView()
            }
        }
    }

    private func delete(workouts toDelete: [Workout]) {
        for workout in toDelete {
            modelContext.delete(workout)
        }
    }
}

#Preview {
    WorkoutHistoryView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self], inMemory: true)
}
