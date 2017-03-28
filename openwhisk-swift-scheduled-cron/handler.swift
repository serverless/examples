func main(args: [String:Any]) -> [String:Any] {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    let now = formatter.string(from: Date())
 
    if let value = ProcessInfo.processInfo.environment["__OW_ACTION_NAME"] {
      print("Swift function (\(value)) was called @ \(now)")
      return [ "cron": "Swift function (\(value)) was called @ \(now)" ]
    }

    print("Swift function was called @ \(now)")
    return [ "cron": "Swift function was called @ \(now)" ]
}

