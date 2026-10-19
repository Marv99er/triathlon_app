import SwiftUI
import SwiftData

@main
struct TriLogApp: App {
    @AppStorage("appearanceMode") private var appearanceModeRaw: String = AppearanceMode.system.rawValue

    let modelContainer: ModelContainer = {
        let schema = Schema([
            Workout.self,
            StrengthExerciseEntry.self,
            Competition.self,
            TrainingPlanDocument.self,
            StrengthRoutine.self
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("SwiftData ModelContainer konnte nicht erstellt werden: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme((AppearanceMode(rawValue: appearanceModeRaw) ?? .system).colorScheme)
        }
        .modelContainer(modelContainer)
    }
}
