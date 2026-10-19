import SwiftUI
import SwiftData

struct DashboardView: View {
    @Query(sort: \Workout.date, order: .reverse) private var allWorkouts: [Workout]

    @State private var showsAddSheet = false
    @State private var showsSettingsSheet = false

    private var weekInterval: DateInterval {
        Calendar.current.dateInterval(of: .weekOfYear, for: .now) ?? DateInterval(start: .now, duration: 0)
    }

    private var workoutsThisWeek: [Workout] {
        allWorkouts.filter { weekInterval.contains($0.date) }
    }

    private var recentWorkouts: [Workout] {
        Array(allWorkouts.prefix(3))
    }

    private var totalWeekDuration: String {
        let totalSeconds = workoutsThisWeek.reduce(0) { $0 + $1.durationSeconds }
        let hours = totalSeconds / 3600
        let minutes = (totalSeconds % 3600) / 60
        return hours > 0 ? "\(hours) Std \(minutes) min" : "\(minutes) min"
    }

    private func weeklyStat(for sport: SportType) -> StatTile {
        let sportWorkouts = workoutsThisWeek.filter { $0.sportType == sport }
        let totalMinutes = sportWorkouts.reduce(0) { $0 + $1.durationSeconds } / 60

        let value: String
        if sport.tracksDistance {
            let totalDistance = sportWorkouts.reduce(0.0) { $0 + ($1.distanceKm ?? 0) }
            value = totalDistance > 0
                ? totalDistance.formatted(.number.precision(.fractionLength(0...1))) + " km"
                : "\(totalMinutes) min"
        } else {
            value = "\(totalMinutes) min"
        }

        return StatTile(
            icon: sport.icon,
            tint: sport.tintColor,
            value: sportWorkouts.isEmpty ? "–" : value,
            label: sport.displayName
        )
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Diese Woche")
                            .font(.title2.weight(.bold))
                        Text(weekInterval.start.formatted(.dateTime.day().month()) + " – " + weekInterval.end.addingTimeInterval(-1).formatted(.dateTime.day().month()))
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }

                    if !workoutsThisWeek.isEmpty {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Gesamtzeit")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text(totalWeekDuration)
                                .font(.system(size: 34, weight: .bold, design: .rounded))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(18)
                        .background(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(Color.accentColor.opacity(0.12))
                        )
                    }

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(SportType.allCases) { sport in
                            weeklyStat(for: sport)
                        }
                    }

                    if !recentWorkouts.isEmpty {
                        sectionCard(title: "Letzte Trainings") {
                            VStack(spacing: 10) {
                                ForEach(recentWorkouts) { workout in
                                    NavigationLink {
                                        WorkoutDetailView(workout: workout)
                                    } label: {
                                        WorkoutRow(workout: workout)
                                    }
                                    .buttonStyle(.plain)
                                    if workout.id != recentWorkouts.last?.id {
                                        Divider()
                                    }
                                }
                            }
                        }
                    }

                    if allWorkouts.isEmpty {
                        EmptyStateView(
                            icon: "figure.run.circle",
                            title: "Willkommen bei TriLog",
                            message: "Trage dein erstes Training ein, um loszulegen.",
                            actionTitle: "Training hinzufügen",
                            action: { showsAddSheet = true }
                        )
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Übersicht")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        showsSettingsSheet = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
                ToolbarItem(placement: .primaryAction) {
                    AddWorkoutMenuButton()
                }
            }
            .sheet(isPresented: $showsAddSheet) {
                WorkoutFormView()
            }
            .sheet(isPresented: $showsSettingsSheet) {
                SettingsView()
            }
        }
    }

    @ViewBuilder
    private func sectionCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            content()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }
}

#Preview {
    DashboardView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self], inMemory: true)
}
