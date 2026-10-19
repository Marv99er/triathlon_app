import SwiftUI

struct CompetitionRow: View {
    let competition: Competition

    private var icon: String {
        competition.isTriathlon ? "trophy.fill" : (competition.sportType?.icon ?? "flag.checkered")
    }

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(Color.orange.opacity(0.15))
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.orange)
            }
            .frame(width: 36, height: 36)

            VStack(alignment: .leading, spacing: 3) {
                Text(competition.name)
                    .font(.subheadline.weight(.semibold))
                Text(competition.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(competition.formattedTotalTime)
                .font(.subheadline.weight(.semibold))
        }
        .padding(.vertical, 4)
    }
}
