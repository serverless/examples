import PackageDescription

let package = Package(
    name: "Action",
    dependencies: [
        .Package(url: "https://github.com/jthomas/OpenWhiskAction.git", majorVersion: 0)
    ]
)
