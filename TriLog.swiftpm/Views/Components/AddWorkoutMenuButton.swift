import SwiftUI
import UniformTypeIdentifiers

/// Toolbar-Button "+": Menü mit "Training eintragen" (manuell) und "Aus Garmin-Datei importieren" (TCX).
/// Wird im Dashboard und im Trainingslog verwendet.
struct AddWorkoutMenuButton: View {
    @State private var showsManualForm = false
    @State private var showsFileImporter = false
    @State private var showsPrefilledForm = false
    @State private var importedDraft: ImportedActivityDraft?
    @State private var showsImportError = false

    var body: some View {
        Menu {
            Button {
                showsManualForm = true
            } label: {
                Label("Training eintragen", systemImage: "square.and.pencil")
            }
            Button {
                showsFileImporter = true
            } label: {
                Label("Aus Garmin-Datei importieren", systemImage: "arrow.down.doc")
            }
        } label: {
            Image(systemName: "plus")
        }
        .sheet(isPresented: $showsManualForm) {
            WorkoutFormView()
        }
        .sheet(isPresented: $showsPrefilledForm) {
            WorkoutFormView(prefillFromImport: importedDraft)
        }
        .fileImporter(
            isPresented: $showsFileImporter,
            allowedContentTypes: [UTType(filenameExtension: "tcx") ?? .xml]
        ) { result in
            switch result {
            case .success(let url):
                handleImport(url: url)
            case .failure:
                showsImportError = true
            }
        }
        .alert("Import fehlgeschlagen", isPresented: $showsImportError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("Datei konnte nicht gelesen werden. Bitte als TCX aus Garmin Connect exportieren (Aktivität öffnen → Exportieren → TCX).")
        }
    }

    private func handleImport(url: URL) {
        guard url.startAccessingSecurityScopedResource() else {
            showsImportError = true
            return
        }
        defer { url.stopAccessingSecurityScopedResource() }

        guard let data = try? Data(contentsOf: url), let draft = GarminTCXParser.parse(data: data) else {
            showsImportError = true
            return
        }

        importedDraft = draft
        showsPrefilledForm = true
    }
}
