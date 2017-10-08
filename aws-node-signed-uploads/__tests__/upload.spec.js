import AWS from 'aws-sdk-mock';
import { promisify } from 'util';
import lambda from '../src/upload';
import eventStub from './stubs/eventHttpApiGateway.json';

const handler = promisify(lambda);

describe(`Service aws-node-singned-uploads: S3 mock for successful operations`, () => {
  beforeAll(() => {
    AWS.mock('S3', 'getSignedUrl', (method, _, callback) => {
      callback(null, {
        data: 'https://example.com',
      });
    });
  });

  afterEach(() => {
    delete process.env.BUCKET;
    delete process.env.REGION;
  });

  afterAll(() => {
    AWS.restore('S3');
  });

  test(`Require environment variables`, () => {
    const event = {};
    const context = {};

    const result = handler(event, context);
    result
      .then(data => {
        expect(data).toBeFalsy();
      })
      .catch(e => {
        expect(e).toBe(
          `Missing required environment variables: BUCKET, REGION`
        );
      });
  });

  test(`Require a header "x-amz-meta-key"`, () => {
    process.env.BUCKET = 'foo';
    process.env.REGION = 'bar';
    const event = {};
    const context = {};

    const result = handler(event, context);
    result.then(data => {
      expect(data).toMatchSnapshot();
    });
  });

  test(`Replies back with a JSON for a signed upload on success`, () => {
    process.env.BUCKET = 'foo';
    process.env.REGION = 'bar';
    const event = eventStub;
    const context = {};

    const result = handler(event, context);
    result.then(data => {
      expect(data).toMatchSnapshot();
    });
  });
});

describe(`Service aws-node-singned-uploads: S3 mock for failed operations`, () => {
  beforeAll(() => {
    AWS.mock('S3', 'getSignedUrl', (method, _, callback) => {
      callback(`S3 failed`);
    });
  });

  afterEach(() => {
    delete process.env.BUCKET;
    delete process.env.REGION;
  });

  afterAll(() => {
    AWS.restore('S3');
  });

  test(`Correctly handles error messages from S3`, () => {
    process.env.BUCKET = 'foo';
    process.env.REGION = 'bar';
    const event = eventStub;
    const context = {};

    const result = handler(event, context);
    result
      .then(data => {
        expect(data).toBeFalsy();
      })
      .catch(e => {
        expect(e).toBe(`S3 failed`);
      });
  });
});
