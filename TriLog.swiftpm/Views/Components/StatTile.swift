import SwiftUI

/// Kompakte Kachel für eine Kennzahl, z. B. im Wochen-Überblick des Dashboards.
struct StatTile: View {
    let icon: String
    let tint: Color
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(tint)

            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(.primary)
                .contentTransition(.numericText())

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }
}

#Preview {
    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
        StatTile(icon: "figure.run", tint: .green, value: "12,4 km", label: "Laufen diese Woche")
        StatTile(icon: "figure.pool.swim", tint: .blue, value: "2,0 km", label: "Schwimmen diese Woche")
    }
    .padding()
    .background(Color(.systemGroupedBackground))
}
