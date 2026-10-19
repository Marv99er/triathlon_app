import SwiftUI

enum SportType: String, Codable, CaseIterable, Identifiable {
    case swim
    case bike
    case run
    case strength

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .swim: return "Schwimmen"
        case .bike: return "Radfahren"
        case .run: return "Laufen"
        case .strength: return "Kraft"
        }
    }

    var shortUnit: String {
        switch self {
        case .swim, .bike, .run: return "km"
        case .strength: return "Übungen"
        }
    }

    var icon: String {
        switch self {
        case .swim: return "figure.pool.swim"
        case .bike: return "figure.outdoor.cycle"
        case .run: return "figure.run"
        case .strength: return "dumbbell.fill"
        }
    }

    var tintColor: Color {
        switch self {
        case .swim: return .blue
        case .bike: return .orange
        case .run: return .green
        case .strength: return .purple
        }
    }

    /// Bei diesen Sportarten wird eine Distanz erfasst; bei Kraft nicht.
    var tracksDistance: Bool {
        self != .strength
    }
}
