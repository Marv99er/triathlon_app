import Foundation
import SwiftData

/// Ein hochgeladenes Trainingsplan-Dokument (PDF oder Foto). Es gibt immer nur ein aktuelles Dokument.
@Model
final class TrainingPlanDocument {
    var id: UUID
    var fileName: String
    var uploadedDate: Date
    @Attribute(.externalStorage) var data: Data

    init(fileName: String, uploadedDate: Date = .now, data: Data) {
        self.id = UUID()
        self.fileName = fileName
        self.uploadedDate = uploadedDate
        self.data = data
    }
}
