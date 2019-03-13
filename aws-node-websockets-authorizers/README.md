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
