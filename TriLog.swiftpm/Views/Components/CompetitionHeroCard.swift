import SwiftUI

/// Große Karte für den letzten Wettkampf, als Ansporn für den nächsten.
struct CompetitionHeroCard: View {
    let competition: Competition

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: competition.isTriathlon ? "trophy.fill" : (competition.sportType?.icon ?? "flag.checkered"))
                    .foregroundStyle(.orange)
                Text(competition.name)
                    .font(.headline)
                Spacer()
                Text(competition.date.formatted(date: .abbreviated, time: .omitted))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(competition.formattedTotalTime)
                .font(.system(size: 40, weight: .bold, design: .rounded))

            if competition.isTriathlon {
                HStack(spacing: 20) {
                    if let swim = competition.swimDurationSeconds {
                        splitLabel("Schwimmen", swim)
                    }
                    if let bike = competition.bikeDurationSeconds {
                        splitLabel("Rad", bike)
                    }
                    if let run = competition.runDurationSeconds {
                        splitLabel("Lauf", run)
                    }
                }
            } else if let distance = competition.distanceKm {
                Text(distance.formatted(.number.precision(.fractionLength(0...2))) + " km")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            if let placement = competition.placement {
                Text("Platzierung: \(placement)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.orange.opacity(0.12))
        )
    }

    private func splitLabel(_ title: String, _ seconds: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(Competition.formatDuration(seconds))
                .font(.caption.weight(.semibold))
        }
    }
}
