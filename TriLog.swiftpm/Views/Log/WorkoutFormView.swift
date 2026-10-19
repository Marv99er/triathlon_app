import SwiftUI
import SwiftData

/// Anlegen oder Bearbeiten eines absolvierten Ausdauertrainings (Schwimmen/Rad/Laufen).
/// Krafttraining wird über den eigenen "Kraft"-Tab erfasst (StrengthSessionFormView).
struct WorkoutFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    /// Wird zum Bearbeiten übergeben; bei nil wird ein neues Training angelegt.
    var existingWorkout: Workout?
    /// Optionale Vorbefüllung aus einem Garmin-TCX-Import.
    var prefillFromImport: ImportedActivityDraft?

    private static let selectableSports = SportType.allCases.filter { $0 != .strength }

    @State private var sportType: SportType = .run
    @State private var date: Date = .now
    @State private var durationMinutesInput: Int = 30
    @State private var durationSecondsInput: Int = 0
    @State private var distanceKm: Double?
    @State private var avgHeartRate: Int?
    @State private var maxHeartRate: Int?
    @State private var rpe: Int = 5
    @State private var notes: String = ""
    @State private var didLoadInitialState = false

    private var isEditing: Bool { existingWorkout != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section("Sportart") {
                    sportPicker
                }

                Section("Wann") {
                    DatePicker("Datum", selection: $date, displayedComponents: [.date])
                }

                Section("Umfang") {
                    HStack {
                        Text("Dauer")
                        Spacer()
                        TextField("min", value: $durationMinutesInput, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 50)
                        Text("min").foregroundStyle(.secondary)
                        TextField("sek", value: $durationSecondsInput, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 40)
                        Text("sek").foregroundStyle(.secondary)
                    }

                    HStack {
                        Text("Distanz")
                        Spacer()
                        TextField("z. B. 10.5", value: $distanceKm, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 100)
                        Text("km").foregroundStyle(.secondary)
                    }
                }

                Section("Puls (optional)") {
                    HStack {
                        Text("Ø Herzfrequenz")
                        Spacer()
                        TextField("bpm", value: $avgHeartRate, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                    }
                    HStack {
                        Text("Max. Herzfrequenz")
                        Spacer()
                        TextField("bpm", value: $maxHeartRate, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                    }
                }

                Section("Anstrengung (RPE \(rpe)/10)") {
                    Slider(value: Binding(get: { Double(rpe) }, set: { rpe = Int($0) }), in: 1...10, step: 1)
                }

                Section("Notizen") {
                    TextField("Wie ist es gelaufen?", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle(isEditing ? "Training bearbeiten" : "Training eintragen")
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
        }
    }

    private var sportPicker: some View {
        HStack(spacing: 10) {
            ForEach(Self.selectableSports) { sport in
                Button {
                    sportType = sport
                } label: {
                    VStack(spacing: 6) {
                        Image(systemName: sport.icon)
                            .font(.system(size: 18, weight: .semibold))
                        Text(sport.displayName)
                            .font(.caption2)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(sportType == sport ? sport.tintColor.opacity(0.18) : Color(.secondarySystemGroupedBackground))
                    )
                    .foregroundStyle(sportType == sport ? sport.tintColor : .secondary)
                }
                .buttonStyle(.plain)
            }
        }
        .listRowInsets(EdgeInsets())
        .padding(.vertical, 6)
        .padding(.horizontal, 4)
    }

    private func loadInitialState() {
        guard !didLoadInitialState else { return }
        didLoadInitialState = true

        if let workout = existingWorkout {
            sportType = workout.sportType
            date = workout.date
            durationMinutesInput = workout.durationSeconds / 60
            durationSecondsInput = workout.durationSeconds % 60
            distanceKm = workout.distanceKm
            avgHeartRate = workout.avgHeartRate
            maxHeartRate = workout.maxHeartRate
            rpe = workout.rpe ?? 5
            notes = workout.notes ?? ""
        } else if let draft = prefillFromImport {
            sportType = draft.sportType ?? .run
            date = draft.date
            durationMinutesInput = draft.durationSeconds / 60
            durationSecondsInput = draft.durationSeconds % 60
            distanceKm = draft.distanceKm
            avgHeartRate = draft.avgHeartRate
            maxHeartRate = draft.maxHeartRate
        }
    }

    private func save() {
        let totalDurationSeconds = max(0, durationMinutesInput) * 60 + max(0, min(59, durationSecondsInput))

        let workout: Workout
        if let existingWorkout {
            workout = existingWorkout
        } else {
            workout = Workout(sportType: sportType, durationSeconds: totalDurationSeconds)
            modelContext.insert(workout)
        }

        workout.sportType = sportType
        workout.date = date
        workout.durationSeconds = totalDurationSeconds
        workout.distanceKm = distanceKm
        workout.avgHeartRate = avgHeartRate
        workout.maxHeartRate = maxHeartRate
        workout.rpe = rpe
        workout.notes = notes.isEmpty ? nil : notes

        dismiss()
    }
}

#Preview {
    WorkoutFormView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self], inMemory: true)
}
