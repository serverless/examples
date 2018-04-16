'use strict';

class Messenger {
  constructor(client) {
    this.client = client;
  }

  send(event) {
    // use twilio SDK to send text message
    const sms = {
      to: event.body.to,
      body: event.body.message || '',
      from: event.from,
    };

    // add image to sms if supplied
    if (event.body.image) {
      sms.mediaUrl = event.body.image;
    }

    return this.client.messages.create(sms);
  }
}

module.exports = Messenger;
