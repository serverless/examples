'use strict';

const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const eventbridge = new AWS.EventBridge({ apiVersion: '2015-10-07' });

function putEvent(event) {
  const detail = { name: 'Message',
    messageSentToAlice: event.body,
  };

  const params = {
    Entries: [
      {
        EventBusName: 'custom-decouple-events',
        Detail: JSON.stringify(detail),
        DetailType: 'Triggering_Bob',
        Source: 'alice.trigger',
      },
    ],
  };

  return eventbridge.putEvents(params).promise();
}

module.exports.alice = async (event) => {
  console.log(`event:${JSON.stringify(event)}`);

  const data = await putEvent(event);
  console.log(data);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Alice was called' }),
  };
};

module.exports.bob = async (event) => {
  console.log(`event:${JSON.stringify(event)}`);

  const eventDetail = event.detail.messageSentToAlice;
  const messageSentFromAlice = JSON.parse(eventDetail).messageSentToAlice;
  console.log(`messageSentFromAlice:${messageSentFromAlice}`);
};

function getRandomIntInclusive(min, max) {
  const mini = Math.ceil(min);
  const maxi = Math.floor(max);
  return Math.floor((Math.random() * ((maxi - mini) + 1)) + mini);
}

module.exports.eve = async (event) => {
  console.log(`event:${JSON.stringify(event)}`);
};

module.exports.dave = async (event) => {
  console.log(`event:${JSON.stringify(event)}`);
  const pokemonNumber = getRandomIntInclusive(1, 151);
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
  const json = await res.json();
  console.log('responseJSON:', JSON.stringify(json));
  return json;
};
