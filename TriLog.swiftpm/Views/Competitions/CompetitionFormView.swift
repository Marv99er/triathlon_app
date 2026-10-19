import SwiftUI
import SwiftData

/// Anlegen oder Bearbeiten eines Wettkampfs: Einzeldisziplin oder Triathlon mit Einzelzeiten.
struct CompetitionFormView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    var existingCompetition: Competition?

    @State private var name = ""
    @State private var date: Date = .now
    @State private var isTriathlon = false
    @State private var sportType: SportType = .run
    @State private var distanceKm: Double?
    @State private var totalTime = TimeComponents()
    @State private var swimTime = TimeComponents()
    @State private var t1Time = TimeComponents()
    @State private var bikeTime = TimeComponents()
    @State private var t2Time = TimeComponents()
    @State private var runTime = TimeComponents()
    @State private var placement: Int?
    @State private var notes = ""
    @State private var didLoadInitialState = false

    private var isEditing: Bool { existingCompetition != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section("Wettkampf") {
                    TextField("Name, z. B. Stadttriathlon Musterhausen", text: $name)
                    DatePicker("Datum", selection: $date, displayedComponents: [.date])
                    Toggle("Triathlon mit Einzelzeiten", isOn: $isTriathlon.animation())
                }

                if !isTriathlon {
                    Section("Disziplin") {
                        Picker("Sportart", selection: $sportType) {
                            ForEach(SportType.allCases) { sport in
                                Label(sport.displayName, systemImage: sport.icon).tag(sport)
                            }
                        }
                        .pickerStyle(.menu)

                        if sportType.tracksDistance {
                            HStack {
                                Text("Distanz")
                                Spacer()
                                TextField("km", value: $distanceKm, format: .number)
                                    .keyboardType(.decimalPad)
                                    .multilineTextAlignment(.trailing)
                                    .frame(width: 80)
                            }
                        }
                    }
                }

                Section("Gesamtzeit (hh:mm:ss)") {
                    DurationField(label: "Zeit", components: $totalTime)
                }

                if isTriathlon {
                    Section("Einzelzeiten (optional)") {
                        DurationField(label: "Schwimmen", components: $swimTime)
                        DurationField(label: "Wechsel 1", components: $t1Time)
                        DurationField(label: "Radfahren", components: $bikeTime)
                        DurationField(label: "Wechsel 2", components: $t2Time)
                        DurationField(label: "Laufen", components: $runTime)
                    }
                }

                Section("Sonstiges") {
                    HStack {
                        Text("Platzierung")
                        Spacer()
                        TextField("optional", value: $placement, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                    }
                    TextField("Notizen", text: $notes, axis: .vertical)
                        .lineLimit(2...5)
                }
            }
            .navigationTitle(isEditing ? "Wettkampf bearbeiten" : "Wettkampf eintragen")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || totalTime.isZero)
                }
            }
            .onAppear(perform: loadInitialState)
        }
    }

    private func loadInitialState() {
        guard !didLoadInitialState else { return }
        didLoadInitialState = true
        guard let competition = existingCompetition else { return }

        name = competition.name
        date = competition.date
        isTriathlon = competition.isTriathlon
        sportType = competition.sportType ?? .run
        distanceKm = competition.distanceKm
        totalTime = .from(seconds: competition.totalDurationSeconds)
        swimTime = .from(seconds: competition.swimDurationSeconds)
        t1Time = .from(seconds: competition.t1DurationSeconds)
        bikeTime = .from(seconds: competition.bikeDurationSeconds)
        t2Time = .from(seconds: competition.t2DurationSeconds)
        runTime = .from(seconds: competition.runDurationSeconds)
        placement = competition.placement
        notes = competition.notes ?? ""
    }

    private func save() {
        let competition: Competition
        if let existingCompetition {
            competition = existingCompetition
        } else {
            competition = Competition(name: name, date: date, isTriathlon: isTriathlon, totalDurationSeconds: totalTime.totalSeconds)
            modelContext.insert(competition)
        }

        competition.name = name
        competition.date = date
        competition.isTriathlon = isTriathlon
        competition.sportType = isTriathlon ? nil : sportType
        competition.distanceKm = isTriathlon ? nil : distanceKm
        competition.totalDurationSeconds = totalTime.totalSeconds
        competition.swimDurationSeconds = (isTriathlon && !swimTime.isZero) ? swimTime.totalSeconds : nil
        competition.t1DurationSeconds = (isTriathlon && !t1Time.isZero) ? t1Time.totalSeconds : nil
        competition.bikeDurationSeconds = (isTriathlon && !bikeTime.isZero) ? bikeTime.totalSeconds : nil
        competition.t2DurationSeconds = (isTriathlon && !t2Time.isZero) ? t2Time.totalSeconds : nil
        competition.runDurationSeconds = (isTriathlon && !runTime.isZero) ? runTime.totalSeconds : nil
        competition.placement = placement
        competition.notes = notes.isEmpty ? nil : notes

        dismiss()
    }
}

#Preview {
    CompetitionFormView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self, Competition.self], inMemory: true)
}
