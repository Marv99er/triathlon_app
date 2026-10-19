import SwiftUI

/// Hinweis für leere Listen, optional mit Aktions-Button (z. B. "Training hinzufügen").
struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String?
    var action: (() -> Void)?

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 36))
                .foregroundStyle(.secondary)

            Text(title)
                .font(.headline)

            Text(message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            if let actionTitle, let action {
                Button(actionTitle, action: action)
                    .buttonStyle(.borderedProminent)
                    .padding(.top, 4)
            }
        }
        .padding(32)
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    EmptyStateView(
        icon: "figure.run.circle",
        title: "Noch keine Trainings",
        message: "Trage dein erstes Training ein, um deinen Fortschritt zu sehen.",
        actionTitle: "Training hinzufügen",
        action: {}
    )
}
