import SwiftUI
import SwiftData
import PhotosUI
import UniformTypeIdentifiers

/// Zeigt den hochgeladenen Trainingsplan (PDF oder Foto) an. Es existiert immer nur ein aktuelles Dokument;
/// ein neuer Upload ersetzt das bisherige.
struct TrainingPlanView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var documents: [TrainingPlanDocument]

    @State private var showsPhotosPicker = false
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var showsFileImporter = false
    @State private var previewURL: URL?
    @State private var showsDeleteConfirmation = false

    private var currentDocument: TrainingPlanDocument? { documents.first }

    var body: some View {
        NavigationStack {
            Group {
                if let document = currentDocument {
                    documentPreview(for: document)
                } else {
                    emptyState
                }
            }
            .navigationTitle("Trainingsplan")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        Button("Foto auswählen") { showsPhotosPicker = true }
                        Button("PDF auswählen") { showsFileImporter = true }
                        if currentDocument != nil {
                            Button("Löschen", role: .destructive) { showsDeleteConfirmation = true }
                        }
                    } label: {
                        Image(systemName: currentDocument == nil ? "plus" : "ellipsis.circle")
                    }
                }
            }
            .photosPicker(isPresented: $showsPhotosPicker, selection: $selectedPhotoItem, matching: .images)
            .onChange(of: selectedPhotoItem) { _, newItem in
                guard let newItem else { return }
                Task {
                    if let data = try? await newItem.loadTransferable(type: Data.self) {
                        await MainActor.run { saveDocument(fileName: "Trainingsplan.jpg", data: data) }
                    }
                    selectedPhotoItem = nil
                }
            }
            .fileImporter(isPresented: $showsFileImporter, allowedContentTypes: [.pdf]) { result in
                guard case .success(let url) = result else { return }
                guard url.startAccessingSecurityScopedResource() else { return }
                defer { url.stopAccessingSecurityScopedResource() }
                if let data = try? Data(contentsOf: url) {
                    saveDocument(fileName: url.lastPathComponent, data: data)
                }
            }
            .confirmationDialog("Trainingsplan wirklich löschen?", isPresented: $showsDeleteConfirmation, titleVisibility: .visible) {
                Button("Löschen", role: .destructive) {
                    for document in documents { modelContext.delete(document) }
                    previewURL = nil
                }
                Button("Abbrechen", role: .cancel) {}
            }
        }
    }

    @ViewBuilder
    private func documentPreview(for document: TrainingPlanDocument) -> some View {
        Group {
            if let previewURL {
                QuickLookPreview(url: previewURL)
            } else {
                ProgressView()
            }
        }
        .onAppear { previewURL = writeTempFile(document: document) }
        .onChange(of: document.id) { _, _ in previewURL = writeTempFile(document: document) }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.text.image")
                .font(.system(size: 36))
                .foregroundStyle(.secondary)
            Text("Kein Trainingsplan hochgeladen")
                .font(.headline)
            Text("Lade ein Foto oder PDF deines Trainingsplans hoch, um ihn jederzeit griffbereit zu haben.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            VStack(spacing: 10) {
                Button("Foto auswählen") { showsPhotosPicker = true }
                    .buttonStyle(.borderedProminent)
                Button("PDF auswählen") { showsFileImporter = true }
                    .buttonStyle(.bordered)
            }
            .padding(.top, 4)
        }
        .padding(32)
        .frame(maxWidth: .infinity)
    }

    private func saveDocument(fileName: String, data: Data) {
        for existing in documents { modelContext.delete(existing) }
        let document = TrainingPlanDocument(fileName: fileName, data: data)
        modelContext.insert(document)
    }

    private func writeTempFile(document: TrainingPlanDocument) -> URL? {
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent(document.fileName)
        do {
            try document.data.write(to: tempURL, options: .atomic)
            return tempURL
        } catch {
            return nil
        }
    }
}

#Preview {
    TrainingPlanView()
        .modelContainer(for: [TrainingPlanDocument.self], inMemory: true)
}
