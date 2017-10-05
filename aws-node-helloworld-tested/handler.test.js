const assert = require('assert');

const hander = require('./handler');

describe('Handler', () => {
  describe('#helloworld', () => {
    it('should return 200 status code', (done) => {
      const callback = (err, result) => {
        assert.equal('200', result.statusCode);
        done();
      };
      hander.helloworld({}, {}, callback);
    });

    it('should return the hellworld message as json', (done) => {
      const callback = (err, result) => {
        assert.equal('Go Serverless v1.0! Your function executed successfully!', JSON.parse(result.body).message);
        done();
      };
      hander.helloworld({}, {}, callback);
    });
  });
});
