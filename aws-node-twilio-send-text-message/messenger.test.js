import { expect } from 'chai';
import sinon from 'sinon';
import Messenger from './messenger.js';

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

describe('Messenger', () => {
  it('should send messages', () => {
    const messenger = new Messenger(client);
    return messenger.send(event).then(() => {
      expect(createMessageStub.called).to.be.true;
    });
  });
});
