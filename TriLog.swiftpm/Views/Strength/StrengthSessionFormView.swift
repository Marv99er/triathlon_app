import SwiftUI
import SwiftData

private struct ExerciseSetDraft: Identifiable {
    let id = UUID()
    var weightKg: Double?
    var reps: Int = 10
    /// true = Wert wurde von einem "Training wiederholen" übernommen und noch nicht bestätigt/geändert.
    var isCarriedOver: Bool = false
}

private struct ExerciseDraft: Identifiable {
    let id = UUID()
    var name: String = ""
    var notes: String = ""
    var sets: [ExerciseSetDraft] = [ExerciseSetDraft(), ExerciseSetDraft(), ExerciseSetDraft()]
}

/// Ein Krafttraining loggen oder bearbeiten: pro Übung eine Satz-Tabelle mit Gewicht + Wiederholungen,
/// dazu eine Anzeige der zuletzt für dieselbe Übung erfassten Werte.
struct StrengthSessionFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query(sort: \Workout.date, order: .reverse) private var allWorkouts: [Workout]

    /// Wird zum Bearbeiten übergeben; bei nil wird ein neues Training angelegt.
    var existingWorkout: Workout?
    /// Vorlage für ein neues Training (z. B. aus dem Wochenplan "Training starten").
    var routine: StrengthRoutine?
    /// Ein vergangenes Training, das als Vorlage für ein neues, heutiges Training dient ("Training wiederholen").
    var repeatFrom: Workout?

    @State private var sessionName: String = ""
    @State private var startTime: Date = .now
    @State private var endTime: Date = .now.addingTimeInterval(45 * 60)
    @State private var bodyWeightKg: Double?
    @State private var rpe: Int = 5
    @State private var sessionNotes: String = ""
    @State private var exercises: [ExerciseDraft] = []
    @State private var didLoadInitialState = false

    private var isEditing: Bool { existingWorkout != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name (optional), z. B. Oberkörper A", text: $sessionName)
                    DatePicker("Startzeit", selection: $startTime, displayedComponents: [.date, .hourAndMinute])
                    DatePicker("Endzeit", selection: $endTime, displayedComponents: [.date, .hourAndMinute])
                    HStack {
                        Text("Körpergewicht")
                        Spacer()
                        TextField("kg", value: $bodyWeightKg, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 70)
                        Text("kg").foregroundStyle(.secondary)
                    }
                }

                ForEach(exercises.indices, id: \.self) { index in
                    Section {
                        exerciseCard(at: index)
                    }
                }
                .onDelete { exercises.remove(atOffsets: $0) }

                Section {
                    Button {
                        exercises.append(ExerciseDraft())
                    } label: {
                        Label("Übung hinzufügen", systemImage: "plus.circle.fill")
                    }
                }

                Section("Anstrengung (RPE \(rpe)/10)") {
                    Slider(value: Binding(get: { Double(rpe) }, set: { rpe = Int($0) }), in: 1...10, step: 1)
                }

                Section("Notizen zum Training") {
                    TextField("Wie ist es gelaufen?", text: $sessionNotes, axis: .vertical)
                        .lineLimit(2...5)
                }
            }
            .navigationTitle(sessionName.isEmpty ? (isEditing ? "Training bearbeiten" : "Krafttraining") : sessionName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern") { save() }
                }
            }
            .onAppear(perform: loadInitialState)
            .onChange(of: startTime) { _, newValue in
                if endTime < newValue { endTime = newValue }
            }
        }
    }

    // MARK: - Übungs-Karte

    private func exerciseCard(at index: Int) -> some View {
        let exercise = $exercises[index]
        return VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top) {
                TextField("Übungsname", text: exercise.name)
                    .font(.headline)
                Spacer()
                Menu {
                    if index > 0 {
                        Button {
                            exercises.swapAt(index, index - 1)
                        } label: {
                            Label("Nach oben verschieben", systemImage: "arrow.up")
                        }
                    }
                    if index < exercises.count - 1 {
                        Button {
                            exercises.swapAt(index, index + 1)
                        } label: {
                            Label("Nach unten verschieben", systemImage: "arrow.down")
                        }
                    }
                    Button("Übung entfernen", role: .destructive) {
                        exercises.remove(at: index)
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundStyle(.secondary)
                        .frame(width: 28, height: 28)
                }
            }

            TextField("Notiz zur Übung", text: exercise.notes)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if !exercise.wrappedValue.sets.isEmpty {
                setsTable(exercise)
            }

            Button {
                exercise.wrappedValue.sets.append(ExerciseSetDraft())
            } label: {
                Label("Satz hinzufügen", systemImage: "plus.circle")
                    .font(.subheadline)
            }

            if let lastTime = lastPerformance(for: exercise.wrappedValue.name) {
                Text("Zuletzt: \(lastTime)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }

    private func setsTable(_ exercise: Binding<ExerciseDraft>) -> some View {
        VStack(spacing: 10) {
            HStack {
                Color.clear.frame(width: 26, height: 1)
                Text("Gewicht")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Text("Wdh.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Color.clear.frame(width: 28, height: 1)
            }

            ForEach(exercise.wrappedValue.sets.indices, id: \.self) { index in
                let setBinding = exercise.sets[index]
                let isCarriedOver = setBinding.wrappedValue.isCarriedOver
                HStack {
                    ZStack {
                        Circle().strokeBorder(Color.secondary.opacity(0.5), lineWidth: 1)
                        Text("\(index + 1)")
                            .font(.caption.weight(.semibold))
                    }
                    .frame(width: 26, height: 26)

                    TextField("kg", value: setBinding.weightKg, format: .number)
                        .keyboardType(.decimalPad)
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .opacity(isCarriedOver ? 0.4 : 1)
                        .onChange(of: setBinding.wrappedValue.weightKg) { _, _ in
                            setBinding.wrappedValue.isCarriedOver = false
                        }

                    TextField("Wdh.", value: setBinding.reps, format: .number)
                        .keyboardType(.numberPad)
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .opacity(isCarriedOver ? 0.4 : 1)
                        .onChange(of: setBinding.wrappedValue.reps) { _, _ in
                            setBinding.wrappedValue.isCarriedOver = false
                        }

                    Menu {
                        Button("Satz entfernen", role: .destructive) {
                            exercise.wrappedValue.sets.remove(at: index)
                        }
                    } label: {
                        Image(systemName: "ellipsis")
                            .foregroundStyle(.secondary)
                            .frame(width: 28, height: 28)
                    }
                }
            }
        }
    }

    // MARK: - Zuletzt-Anzeige

    private func lastPerformance(for name: String) -> String? {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return nil }

        for workout in allWorkouts where workout.id != existingWorkout?.id {
            if let match = workout.strengthExercises.first(where: { $0.name.caseInsensitiveCompare(trimmed) == .orderedSame }) {
                return match.summary
            }
        }
        return nil
    }

    // MARK: - Laden & Speichern

    private func loadInitialState() {
        guard !didLoadInitialState else { return }
        didLoadInitialState = true

        if let workout = existingWorkout {
            sessionName = workout.routineName ?? ""
            startTime = workout.date
            endTime = workout.date.addingTimeInterval(TimeInterval(workout.durationSeconds))
            bodyWeightKg = workout.bodyWeightKg
            rpe = workout.rpe ?? 5
            sessionNotes = workout.notes ?? ""
            exercises = workout.strengthExercises
                .sorted { $0.order < $1.order }
                .map { entry in
                    ExerciseDraft(
                        name: entry.name,
                        notes: entry.notes ?? "",
                        sets: entry.sets.map { ExerciseSetDraft(weightKg: $0.weightKg, reps: $0.reps) }
                    )
                }
        } else if let source = repeatFrom {
            sessionName = source.routineName ?? ""
            startTime = .now
            endTime = .now.addingTimeInterval(TimeInterval(source.durationSeconds))
            exercises = source.strengthExercises
                .sorted { $0.order < $1.order }
                .map { entry in
                    ExerciseDraft(
                        name: entry.name,
                        notes: "",
                        sets: entry.sets.map { ExerciseSetDraft(weightKg: $0.weightKg, reps: $0.reps, isCarriedOver: true) }
                    )
                }
        } else if let routine {
            sessionName = routine.name
            exercises = routine.exerciseNames.map { ExerciseDraft(name: $0) }
        }

        if exercises.isEmpty {
            exercises = [ExerciseDraft()]
        }
    }

    private func save() {
        let totalDurationSeconds = max(0, Int(endTime.timeIntervalSince(startTime)))

        let workout: Workout
        if let existingWorkout {
            workout = existingWorkout
        } else {
            workout = Workout(sportType: .strength, durationSeconds: totalDurationSeconds)
            modelContext.insert(workout)
        }

        workout.date = startTime
        workout.durationSeconds = totalDurationSeconds
        workout.bodyWeightKg = bodyWeightKg
        workout.rpe = rpe
        workout.notes = sessionNotes.isEmpty ? nil : sessionNotes
        workout.routineName = sessionName.trimmingCharacters(in: .whitespaces).isEmpty
            ? nil
            : sessionName.trimmingCharacters(in: .whitespaces)

        for exercise in workout.strengthExercises {
            modelContext.delete(exercise)
        }
        workout.strengthExercises = []

        for (index, draft) in exercises.enumerated() where !draft.name.trimmingCharacters(in: .whitespaces).isEmpty {
            let sets = draft.sets.map { ExerciseSet(weightKg: $0.weightKg, reps: $0.reps) }
            let entry = StrengthExerciseEntry(
                name: draft.name.trimmingCharacters(in: .whitespaces),
                notes: draft.notes.isEmpty ? nil : draft.notes,
                order: index,
                sets: sets
            )
            entry.workout = workout
            workout.strengthExercises.append(entry)
        }

        dismiss()
    }
}

#Preview {
    StrengthSessionFormView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self, StrengthRoutine.self], inMemory: true)
}
