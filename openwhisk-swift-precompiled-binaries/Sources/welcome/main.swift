import OpenWhiskAction

func hello(args: [String:Any]) -> [String:Any] {
  if let name = args["name"] as? String {
    return [ "greeting" : "Welcome \(name)!" ]
  } else {
    return [ "greeting" : "Welcome stranger!" ]
  }
}

OpenWhiskAction(main: hello)
