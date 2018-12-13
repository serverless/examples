<!--
title: TODO
description: Connect to Dropbox's API using AWS Lambda.
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: Jay Deshmukh
authorAvatar: 'https://avatars0.githubusercontent.com/u/38460988?v=4&s=140'
-->

### 

#### For Dev 
1. Create an app from 'https://www.dropbox.com/developers/apps'
2. Set Redirect URI as 'http://localhost:9999/dropbox/callback'
3. Get ClientId , ClientSecret ,  CallbackUrl and paste it into /config/default.yml
    - Change profile in serverless.yml with your respective profile 
    - run `npm install`
    - run `npm run dev`
4. Go To  `http://localhost:9999/dropbox/'
5. Authenticate and Authorize
6. Copy the Access Token
7. Make the final request to dropbox api (To generate a temprory link of a file)

    ```
    curl -X POST \
    https://api.dropboxapi.com/2/files/get_temporary_link \
    -H 'Authorization: Bearer <token> ' \
    -H 'Cache-Control: no-cache' \
    -H 'Content-Type: application/json' \
    -d '{
        "path" : "/temp.rtf" 
    }'

P.S :-  add your access token in Authorization header after Bearer eg :- [Bearer aklfbakbjkasbcbvkcjba] and make sure there exists the temp.rtf file in your dropbox root directory

### For Dev Test 

1. Go to `default_test.yml`
2. Change the EMAIL and PASSWORD with your own dropbox credentials 
3. `npm run test` 


### For deploying on AWS
-  Follow the same procedure for deploying it on AWS just make the necessary changes in the following files
    - `config/stage.yml`
    - `config/stage_test.yml`
    - `test/test.js  (link to stage_test.yml)`