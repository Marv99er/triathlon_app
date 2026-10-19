import SwiftUI
import SwiftData

/// Anlegen oder Bearbeiten einer Kraft-Routine: Name, fester Wochentag, Übungsliste.
struct StrengthRoutineEditorView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    var existingRoutine: StrengthRoutine?
    var prefillWeekday: Int?

    @State private var name = ""
    @State private var assignedWeekday: Int?
    @State private var exerciseNames: [String] = [""]
    @State private var didLoadInitialState = false

    private var isEditing: Bool { existingRoutine != nil }

    private static let weekdayNames = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Name") {
                    TextField("z. B. Oberkörper A", text: $name)
                }

                Section("Wochentag") {
                    Picker("Wochentag", selection: $assignedWeekday) {
                        Text("Kein fester Tag").tag(Int?.none)
                        ForEach(1...7, id: \.self) { day in
                            Text(Self.weekdayNames[day - 1]).tag(Int?.some(day))
                        }
                    }
                }

                Section("Übungen") {
                    ForEach(exerciseNames.indices, id: \.self) { index in
                        HStack {
                            TextField("Übungsname", text: $exerciseNames[index])
                            if exerciseNames.count > 1 {
                                Button {
                                    exerciseNames.remove(at: index)
                                } label: {
                                    Image(systemName: "minus.circle.fill")
                                        .foregroundStyle(.red)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    Button {
                        exerciseNames.append("")
                    } label: {
                        Label("Übung hinzufügen", systemImage: "plus.circle.fill")
                    }
                }

                if isEditing {
                    Section {
                        Button("Routine löschen", role: .destructive) {
                            if let existingRoutine {
                                modelContext.delete(existingRoutine)
                            }
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle(isEditing ? "Routine bearbeiten" : "Neue Routine")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: loadInitialState)
        }
    }

    private func loadInitialState() {
        guard !didLoadInitialState else { return }
        didLoadInitialState = true

        if let routine = existingRoutine {
            name = routine.name
            assignedWeekday = routine.assignedWeekday
            exerciseNames = routine.exerciseNames.isEmpty ? [""] : routine.exerciseNames
        } else {
            assignedWeekday = prefillWeekday
        }
    }

    private func save() {
        let cleanedNames = exerciseNames
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }

        let routine: StrengthRoutine
        if let existingRoutine {
            routine = existingRoutine
        } else {
            routine = StrengthRoutine(name: name)
            modelContext.insert(routine)
        }

        routine.name = name
        routine.assignedWeekday = assignedWeekday
        routine.exerciseNames = cleanedNames

        dismiss()
    }
}

#Preview {
    StrengthRoutineEditorView()
        .modelContainer(for: [StrengthRoutine.self], inMemory: true)
}
