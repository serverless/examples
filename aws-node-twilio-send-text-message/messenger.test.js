'use strict';

const expect = require('chai').expect; // eslint-disable-line
const sinon = require('sinon'); // eslint-disable-line

const Messenger = require('./messenger.js');

const createMessageStub = sinon.stub().returns(Promise.resolve({}));

const client = {
  messages: {
    create: createMessageStub,
  },
};

const event = {
  body: {
    to: '+112345',
    messege: 'serverless rocks',
    image: 'cats.jpg',
  },
  from: '+154321',
};

describe('Messenger', () => { // eslint-disable-line
  it('should send messages', () => { // eslint-disable-line
    const messenger = new Messenger(client);
    messenger.send(event)
    .then(() => {
      expect(createMessageStub.called).to.be.true; // eslint-disable-line
    });
  });
});
