import SwiftUI
import SwiftData

private enum RoutineSheetTarget: Identifiable {
    case new(weekday: Int?)
    case edit(StrengthRoutine)

    var id: String {
        switch self {
        case .new(let weekday): return "new-\(weekday ?? -1)"
        case .edit(let routine): return "edit-\(routine.id)"
        }
    }
}

private enum SessionSheetTarget: Identifiable {
    case new(routine: StrengthRoutine?)
    case edit(Workout)

    var id: String {
        switch self {
        case .new(let routine): return "new-\(routine?.id.uuidString ?? "freeform")"
        case .edit(let workout): return "edit-\(workout.id)"
        }
    }
}

/// Startpunkt des Kraft-Tabs: Wochenplan mit Routinen, Schnellzugriff für freies Training,
/// Link zur Monatsübersicht.
struct StrengthHomeView: View {
    @Query(sort: \StrengthRoutine.name) private var routines: [StrengthRoutine]

    @State private var routineSheetTarget: RoutineSheetTarget?
    @State private var sessionSheetTarget: SessionSheetTarget?

    private static let weekdaySymbols = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

    var body: some View {
        NavigationStack {
            List {
                Section("Wochenplan") {
                    ForEach(1...7, id: \.self) { weekday in
                        weekdayRow(weekday)
                    }
                }

                Section {
                    Button {
                        sessionSheetTarget = .new(routine: nil)
                    } label: {
                        Label("Freies Training loggen", systemImage: "plus.circle.fill")
                    }

                    NavigationLink {
                        StrengthMonthOverviewView()
                    } label: {
                        Label("Monatsübersicht", systemImage: "calendar")
                    }
                }
            }
            .navigationTitle("Kraft")
            .sheet(item: $routineSheetTarget) { target in
                switch target {
                case .new(let weekday):
                    StrengthRoutineEditorView(prefillWeekday: weekday)
                case .edit(let routine):
                    StrengthRoutineEditorView(existingRoutine: routine)
                }
            }
            .sheet(item: $sessionSheetTarget) { target in
                switch target {
                case .new(let routine):
                    StrengthSessionFormView(routine: routine)
                case .edit(let workout):
                    StrengthSessionFormView(existingWorkout: workout)
                }
            }
        }
    }

    private func weekdayRow(_ weekday: Int) -> some View {
        let routine = routines.first { $0.assignedWeekday == weekday }

        return HStack {
            Text(Self.weekdaySymbols[weekday - 1])
                .font(.subheadline.weight(.semibold))
                .frame(width: 32, alignment: .leading)

            if let routine {
                Text(routine.name)
                Spacer()
                Button("Training starten") {
                    sessionSheetTarget = .new(routine: routine)
                }
                .font(.caption)
                .buttonStyle(.bordered)
            } else {
                Text("–")
                    .foregroundStyle(.secondary)
                Spacer()
            }
        }
        .contentShape(Rectangle())
        .onTapGesture {
            if let routine {
                routineSheetTarget = .edit(routine)
            } else {
                routineSheetTarget = .new(weekday: weekday)
            }
        }
    }
}

#Preview {
    StrengthHomeView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self, StrengthRoutine.self], inMemory: true)
}
