// swift-tools-version: 5.9

import PackageDescription
import AppleProductTypes

let package = Package(
    name: "TriLog",
    platforms: [
        .iOS("17.0")
    ],
    products: [
        .iOSApplication(
            name: "TriLog",
            targets: ["TriLog"],
            bundleIdentifier: "Marv99er.trilog",
            teamIdentifier: nil,
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .asset("AppIcon"),
            accentColor: .presetColor(.blue),
            supportedDeviceFamilies: [
                .phone
            ],
            supportedInterfaceOrientations: [
                .portrait
            ]
        )
    ],
    targets: [
        .executableTarget(
            name: "TriLog",
            path: "."
        )
    ]
)
