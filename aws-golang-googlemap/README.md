<!--
title: 'Google Map API'
description: 'Serverless example using golang to hit google map api'
framework: v4
platform: AWS
language: Go
priority: 10
authorLink: 'https://github.com/pramonow'
authorName: 'Pramono Winata'
authorAvatar: 'https://avatars0.githubusercontent.com/u/28787057?v=4&s=140'
-->

# Serverless-golang google map api
Serverless example using golang to hit google map api'

Change your API KEY in the yml file, then build and deploy:

```bash
make build
serverless deploy
```

There are three endpoint provided:
1. GET Geolocation endpoint with address param (geolocation?address=$address) 
2. GET Nearby Location with location and radius param, also name which is optional param (nearbylocation?name=$name&radius=$radius)
3. GET GeoDetail with place id (geodetail?placeid=$placeid)
