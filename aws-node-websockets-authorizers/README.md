<!--
title: 'Simple Websocket Authorizers'
description: 'The example shows you how to deploy simple websocket authorizers'
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/eahefnawy'
authorName: 'Eslam λ Hefnawy'
authorAvatar: 'https://avatars3.githubusercontent.com/u/2312463?v=4&s=140'
-->

# Simple Websockets Authorizers Example

* Deploy the example service.
* connect to the outputted wss url using `wscat`:

```
wscat -c <wss-url>
```

* Connection should fail. If you try again, this time specifying an `Auth` header:

 ```
 wscat -c <wss-url> -H Auth:secret
 ```
 * Connection succeeds.
 * Feel free to chat with yourself :)
