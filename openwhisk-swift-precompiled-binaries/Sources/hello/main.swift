import OpenWhiskAction

func hello(args: [String:Any]) -> [String:Any] {
  if let name = args["name"] as? String {
    return [ "greeting" : "Hello \(name)!" ]
  } else {
    return [ "greeting" : "Hello stranger!" ]
  }
}

OpenWhiskAction(main: hello)
