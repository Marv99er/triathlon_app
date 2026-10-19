import SwiftUI

/// Icon einer Sportart in einem farbigen Kreis, optional mit Beschriftung daneben.
struct SportBadge: View {
    let sportType: SportType
    var showsLabel: Bool = false
    var size: CGFloat = 36

    var body: some View {
        HStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(sportType.tintColor.opacity(0.15))
                Image(systemName: sportType.icon)
                    .font(.system(size: size * 0.45, weight: .semibold))
                    .foregroundStyle(sportType.tintColor)
            }
            .frame(width: size, height: size)

            if showsLabel {
                Text(sportType.displayName)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.primary)
            }
        }
    }
}

#Preview {
    VStack(alignment: .leading, spacing: 16) {
        ForEach(SportType.allCases) { sport in
            SportBadge(sportType: sport, showsLabel: true)
        }
    }
    .padding()
}
