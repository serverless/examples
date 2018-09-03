'use strict';

module.exports = (context, req) => {
    var request = require('request');

    const token = "YOUR_API_TOKEN";

    const BASE_URL = "https://api.telegram.org/bot"+token+"/sendMessage";

    const chatId = req.body.message.chat.id;

    request.post(BASE_URL).form({text :'Hello World!', chat_id: chatId});

    context.res = {
    // status: 200, /* Defaults to 200 */
        body: 'ok',
    };    

    context.done();
};


