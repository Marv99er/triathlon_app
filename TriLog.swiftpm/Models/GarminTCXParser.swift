import Foundation

/// Aus einer TCX-Datei ausgelesene Zusammenfassung einer Aktivität, zur Vorbefüllung von WorkoutFormView.
struct ImportedActivityDraft {
    var date: Date
    var sportType: SportType?
    var durationSeconds: Int
    var distanceKm: Double?
    var avgHeartRate: Int?
    var maxHeartRate: Int?
}

/// Liest eine Garmin-TCX-Datei (Training Center XML) und fasst alle Laps einer Aktivität zusammen.
enum GarminTCXParser {
    static func parse(data: Data) -> ImportedActivityDraft? {
        let delegate = TCXParserDelegate()
        let parser = XMLParser(data: data)
        parser.delegate = delegate
        guard parser.parse() else { return nil }
        return delegate.makeDraft()
    }
}

private final class TCXParserDelegate: NSObject, XMLParserDelegate {
    private var currentElementPath: [String] = []
    private var currentText = ""

    private var activitySport: String?
    private var activityId: String?

    private var lapStartTime: String?
    private var lapTotalTimeSeconds: Double?
    private var lapDistanceMeters: Double?
    private var lapAvgHeartRate: Double?
    private var lapMaxHeartRate: Double?

    private var totalSeconds: Double = 0
    private var totalMeters: Double = 0
    private var weightedHeartRateSum: Double = 0
    private var weightedHeartRateSeconds: Double = 0
    private var maxHeartRate: Double?
    private var earliestStartTime: String?

    private var isInHeartRateAverage = false
    private var isInHeartRateMaximum = false

    /// Der Elementname des direkten Elternelements (currentElementPath enthält das aktuelle Element noch).
    private var parentElement: String? {
        currentElementPath.count >= 2 ? currentElementPath[currentElementPath.count - 2] : nil
    }

    func parser(_ parser: XMLParser, didStartElement elementName: String, namespaceURI: String?, qualifiedName qName: String?, attributes attributeDict: [String: String] = [:]) {
        currentElementPath.append(elementName)
        currentText = ""

        switch elementName {
        case "Activity":
            activitySport = attributeDict["Sport"]
        case "Lap":
            lapStartTime = attributeDict["StartTime"]
            lapTotalTimeSeconds = nil
            lapDistanceMeters = nil
            lapAvgHeartRate = nil
            lapMaxHeartRate = nil
        case "AverageHeartRateBpm":
            isInHeartRateAverage = true
        case "MaximumHeartRateBpm":
            isInHeartRateMaximum = true
        default:
            break
        }
    }

    func parser(_ parser: XMLParser, foundCharacters string: String) {
        currentText += string
    }

    func parser(_ parser: XMLParser, didEndElement elementName: String, namespaceURI: String?, qualifiedName qName: String?) {
        let trimmed = currentText.trimmingCharacters(in: .whitespacesAndNewlines)

        switch elementName {
        case "Id":
            if parentElement == "Activity", activityId == nil {
                activityId = trimmed
            }
        case "TotalTimeSeconds":
            // Nur direkte Kinder von <Lap> zählen (Trackpoints tragen dieses Feld nicht).
            if parentElement == "Lap" {
                lapTotalTimeSeconds = Double(trimmed)
            }
        case "DistanceMeters":
            // Sowohl <Lap> als auch <Trackpoint> haben <DistanceMeters> — nur den Lap-Wert übernehmen.
            if parentElement == "Lap" {
                lapDistanceMeters = Double(trimmed)
            }
        case "Value":
            if isInHeartRateAverage {
                lapAvgHeartRate = Double(trimmed)
            } else if isInHeartRateMaximum {
                lapMaxHeartRate = Double(trimmed)
            }
        case "AverageHeartRateBpm":
            isInHeartRateAverage = false
        case "MaximumHeartRateBpm":
            isInHeartRateMaximum = false
        case "Lap":
            let seconds = lapTotalTimeSeconds ?? 0
            totalSeconds += seconds
            totalMeters += lapDistanceMeters ?? 0
            if let avg = lapAvgHeartRate {
                weightedHeartRateSum += avg * seconds
                weightedHeartRateSeconds += seconds
            }
            if let max = lapMaxHeartRate {
                maxHeartRate = Swift.max(maxHeartRate ?? 0, max)
            }
            if let start = lapStartTime, earliestStartTime == nil || start < earliestStartTime! {
                earliestStartTime = start
            }
        default:
            break
        }

        currentText = ""
        if !currentElementPath.isEmpty {
            currentElementPath.removeLast()
        }
    }

    func makeDraft() -> ImportedActivityDraft? {
        guard totalSeconds > 0 else { return nil }

        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let isoFormatterNoFraction = ISO8601DateFormatter()

        let dateSource = earliestStartTime ?? activityId
        let date = dateSource.flatMap { isoFormatter.date(from: $0) ?? isoFormatterNoFraction.date(from: $0) } ?? .now

        let sportType: SportType?
        switch activitySport {
        case "Running": sportType = .run
        case "Biking": sportType = .bike
        default: sportType = nil
        }

        return ImportedActivityDraft(
            date: date,
            sportType: sportType,
            durationSeconds: Int(totalSeconds.rounded()),
            distanceKm: totalMeters > 0 ? totalMeters / 1000 : nil,
            avgHeartRate: weightedHeartRateSeconds > 0 ? Int((weightedHeartRateSum / weightedHeartRateSeconds).rounded()) : nil,
            maxHeartRate: maxHeartRate.map { Int($0.rounded()) }
        )
    }
}
