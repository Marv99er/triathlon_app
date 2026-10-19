import SwiftUI
import SwiftData

struct CompetitionsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Competition.date, order: .reverse) private var competitions: [Competition]

    @State private var showsAddSheet = false
    @State private var editingCompetition: Competition?

    private var latest: Competition? { competitions.first }

    private var history: [Competition] {
        guard let latest else { return [] }
        return competitions.filter { $0.id != latest.id }
    }

    var body: some View {
        NavigationStack {
            Group {
                if competitions.isEmpty {
                    EmptyStateView(
                        icon: "flag.checkered",
                        title: "Noch kein Wettkampf",
                        message: "Trage deinen letzten Wettkampf ein, um deine Zeiten im Blick zu behalten.",
                        actionTitle: "Wettkampf hinzufügen",
                        action: { showsAddSheet = true }
                    )
                } else {
                    List {
                        if let latest {
                            Section("Letzter Wettkampf") {
                                CompetitionHeroCard(competition: latest)
                                    .contentShape(Rectangle())
                                    .onTapGesture { editingCompetition = latest }
                                    .listRowInsets(EdgeInsets())
                                    .padding(12)
                            }
                        }

                        if !history.isEmpty {
                            Section("Verlauf") {
                                ForEach(history) { competition in
                                    CompetitionRow(competition: competition)
                                        .contentShape(Rectangle())
                                        .onTapGesture { editingCompetition = competition }
                                }
                                .onDelete { offsets in
                                    for index in offsets {
                                        modelContext.delete(history[index])
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Wettkämpfe")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showsAddSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showsAddSheet) {
                CompetitionFormView()
            }
            .sheet(item: $editingCompetition) { competition in
                CompetitionFormView(existingCompetition: competition)
            }
        }
    }
}

#Preview {
    CompetitionsView()
        .modelContainer(for: [Workout.self, StrengthExerciseEntry.self, Competition.self], inMemory: true)
}
