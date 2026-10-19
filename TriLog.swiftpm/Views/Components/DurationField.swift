import SwiftUI

/// Eingabezeile für eine Zeit im Format hh:mm:ss, z. B. für Wettkampfzeiten.
struct DurationField: View {
    let label: String
    @Binding var components: TimeComponents

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            numberField($components.hours, placeholder: "hh")
            Text(":").foregroundStyle(.secondary)
            numberField($components.minutes, placeholder: "mm")
            Text(":").foregroundStyle(.secondary)
            numberField($components.seconds, placeholder: "ss")
        }
    }

    private func numberField(_ value: Binding<Int>, placeholder: String) -> some View {
        TextField(placeholder, value: value, format: .number)
            .keyboardType(.numberPad)
            .multilineTextAlignment(.center)
            .frame(width: 34)
    }
}
