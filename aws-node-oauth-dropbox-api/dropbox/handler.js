import request from 'request';
import btoa from 'btoa';

//User Authorization to get a code 
export const step1 = (data_ , context , callBack) => {
    const state = Math.round(Math.random() * 10);
    const url = `https://www.dropbox.com/1/oauth2/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${process.env.CALLBACK_URL}&state=${state}`;
    callBack(null,{
        statusCode : 302 ,
        headers : {
            location : url
        }
    })
}

//get a access token to make requests to the api (Make Request From Postman)
export const step2 = (data_ , context , callBack ) => {  
    const base64 =  btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`)
    const options = { 
      method: 'POST',
      url: 'https://api.dropbox.com/1/oauth2/token',
      headers: 
       { 
         'Content-Type': 'application/x-www-form-urlencoded',
         'Cache-Control': 'no-cache',
         Authorization: `Basic ${base64}`, 
       },
      form: 
       { code: data_.queryStringParameters.code,
         grant_type: 'authorization_code',
         redirect_uri: process.env.CALLBACK_URL 
       } 
    };
    
    request(options, function (error, response, body) {
        callBack(null , {
            statusCode : 200 ,
            body
        })
    });
     
}