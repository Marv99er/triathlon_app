import SwiftUI

struct RootView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Übersicht", systemImage: "house.fill")
                }

            TrainingPlanView()
                .tabItem {
                    Label("Plan", systemImage: "calendar")
                }

            WorkoutHistoryView()
                .tabItem {
                    Label("Log", systemImage: "list.bullet.clipboard")
                }

            StrengthHomeView()
                .tabItem {
                    Label("Kraft", systemImage: "dumbbell.fill")
                }

            CompetitionsView()
                .tabItem {
                    Label("Wettkämpfe", systemImage: "trophy.fill")
                }
        }
    }
}

#Preview {
    RootView()
        .modelContainer(
            for: [Workout.self, StrengthExerciseEntry.self, Competition.self, TrainingPlanDocument.self, StrengthRoutine.self],
            inMemory: true
        )
}
