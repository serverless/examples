<!--
title: OpenWhisk Swift example with external libraries and pre-compiled binaries
description: This example shows you how to use external packages and deploy
binaries
layout: Doc
-->
# Serverless OpenWhisk Swift Template

Hello! 😎

This is a template Swift service with pre-compiled binaries for the OpenWhisk platform. Before you can deploy your service, please follow the instructions below…

### Have you set up your account credentials?

Before you can deploy your service to OpenWhisk, you need to have an account registered with the platform.

- *Want to run the platform locally?* Please read the project's [*Quick Start*](https://github.com/openwhisk/openwhisk#quick-start) guide for deploying it locally.
- *Want to use a hosted provider?* Please sign up for an account with [IBM Bluemix](https://console.ng.bluemix.net/) and then follow the instructions for getting access to [OpenWhisk on Bluemix](https://console.ng.bluemix.net/openwhisk/). 

Account credentials for OpenWhisk can be provided through a configuration file or environment variables. This plugin requires the API endpoint, namespace and authentication credentials.

**Do you want to use a configuration file for storing these values?** Please [follow the instructions](https://console.ng.bluemix.net/openwhisk/cli) for setting up the OpenWhisk command-line utility. This tool stores account credentials in the `.wskprops` file in the user's home directory. The plugin automatically extracts credentials from this file at runtime.  No further configuration is needed.

**Do you want to use environment variables for credentials?** Use the following environment variables to be pass in account credentials. These values override anything extracted from the configuration file.

- *OW_APIHOST* - Platform endpoint, e.g. `openwhisk.ng.bluemix.net`
- *OW_AUTH* - Authentication key, e.g. `xxxxxx:yyyyy



### Have you installed and setup the provider plugin?

Using the framework with the OpenWhisk platform needs you to install the provider plugin and link this to your service. 

####  Install the provider plugin

```
$ npm install --global serverless-openwhisk
```

*Due to an [outstanding issue](https://github.com/serverless/serverless/issues/2895) with provider plugins, the [OpenWhisk provider](https://github.com/serverless/serverless-openwhisk) must be installed as a global module.*


#### Link provider plugin to service directory

Using `npm link` will import the provider plugin into the service directory. Running `npm install` will automatically perform this using a `post install` script. This also installs other serverless plugins (`serverless-plugin-scripts`) used in this project.

```
$ npm install
```

**_…and that's it!_**

### Project Set-Up

This template project contains a Swift package that generates multiple binaries during the build process. These binaries are used to create separate OpenWhisk actions. 

```
$ tree .
.
├── Package.swift
├── README.md
├── Sources
│   ├── hello
│   │   └── main.swift
│   └── welcome
│       └── main.swift
├── package.json
└── serverless.yml

```

Swift action sources files use an [external package library](https://packagecatalog.com/package/jthomas/OpenWhiskAction) to handle wrapping functions within a shim for execution on the platform.

```
import OpenWhiskAction

func hello(args: [String:Any]) -> [String:Any] {
  if let name = args["name"] as? String {
    return [ "greeting" : "Hello \(name)!" ]
  } else {
    return [ "greeting" : "Hello stranger!" ]
  }
}

OpenWhiskAction(main: hello)
```

Binaries must be compiled for the correct platform architecture. This example uses the following Docker command to run the build in the OpenWhisk Swift environment.

```
docker run --rm -it -v $(pwd):/swift-package openwhisk/action-swift-v3.1.1 bash -e -c 'cd /swift-package && swift build -v -c release'
```

Plugins for the framework handle running the build scripts using npm prior to deployment.

```
custom:
  scripts:
    hooks:
      'package:initialize': npm run-script compile

plugins:
  - serverless-openwhisk
  - serverless-plugin-scripts
```

### Deploy Service

Use the `serverless` command to deploy your service. 

```shell
serverless deploy
```

If this command is successful, you can invoke both serverless functions defined in your configuration.

```
$ serverless invoke -f hello
{
    "greeting": "Hello stranger!"
}
$ serverless invoke -f welcome
{
    "greeting": "Welcome stranger!"
}
```

### Issues / Feedback / Feature Requests?

If you have any issues, comments or want to see new features, please file an issue in the project repository:

https://github.com/serverless/serverless-openwhisk
