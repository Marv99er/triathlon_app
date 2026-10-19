import SwiftUI
import SwiftData

struct WorkoutDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Bindable var workout: Workout

    @State private var showsEditSheet = false
    @State private var showsRepeatSheet = false
    @State private var showsDeleteConfirmation = false

    var body: some View {
        List {
            Section {
                HStack {
                    SportBadge(sportType: workout.sportType, showsLabel: true, size: 44)
                    Spacer()
                    Text(workout.date.formatted(date: .abbreviated, time: .omitted))
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }

            if let routineName = workout.routineName {
                Section {
                    LabeledContent("Routine", value: routineName)
                }
            }

            Section("Kennzahlen") {
                LabeledContent("Dauer", value: workout.formattedDuration)
                if workout.sportType.tracksDistance, let distance = workout.distanceKm {
                    LabeledContent("Distanz", value: distance.formatted(.number.precision(.fractionLength(0...2))) + " km")
                }
                if let averagePace = workout.averagePace {
                    LabeledContent(workout.sportType == .bike ? "Ø Geschwindigkeit" : "Ø Pace", value: averagePace)
                }
                if let bodyWeight = workout.bodyWeightKg {
                    LabeledContent("Körpergewicht", value: bodyWeight.formatted(.number.precision(.fractionLength(0...1))) + " kg")
                }
                if let avgHeartRate = workout.avgHeartRate {
                    LabeledContent("Ø Herzfrequenz", value: "\(avgHeartRate) bpm")
                }
                if let maxHeartRate = workout.maxHeartRate {
                    LabeledContent("Max. Herzfrequenz", value: "\(maxHeartRate) bpm")
                }
                if let rpe = workout.rpe {
                    LabeledContent("Anstrengung (RPE)", value: "\(rpe)/10")
                }
            }

            if workout.sportType == .strength && !workout.strengthExercises.isEmpty {
                Section("Übungen") {
                    ForEach(workout.strengthExercises.sorted(by: { $0.order < $1.order })) { exercise in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(exercise.name)
                                .font(.subheadline.weight(.medium))
                            Text(exercise.summary)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            if let notes = exercise.notes, !notes.isEmpty {
                                Text(notes)
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
            }

            if let notes = workout.notes, !notes.isEmpty {
                Section("Notizen") {
                    Text(notes)
                }
            }

            Section {
                Button("Training löschen", role: .destructive) {
                    showsDeleteConfirmation = true
                }
            }
        }
        .navigationTitle(workout.routineName ?? workout.sportType.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button {
                        showsEditSheet = true
                    } label: {
                        Label("Bearbeiten", systemImage: "pencil")
                    }
                    if workout.sportType == .strength {
                        Button {
                            showsRepeatSheet = true
                        } label: {
                            Label("Training wiederholen", systemImage: "arrow.clockwise")
                        }
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showsEditSheet) {
            if workout.sportType == .strength {
                StrengthSessionFormView(existingWorkout: workout)
            } else {
                WorkoutFormView(existingWorkout: workout)
            }
        }
        .sheet(isPresented: $showsRepeatSheet) {
            StrengthSessionFormView(repeatFrom: workout)
        }
        .confirmationDialog("Training wirklich löschen?", isPresented: $showsDeleteConfirmation, titleVisibility: .visible) {
            Button("Löschen", role: .destructive) {
                modelContext.delete(workout)
                dismiss()
            }
            Button("Abbrechen", role: .cancel) {}
        }
    }
}
