'use strict'

// Res - Response Class
class Res {

  constructor(config, cb) {
    this.res = {
      status: 200,
      body: {},
      headers: {}
    }
    this.cb = cb;
  }

  // Status = sets status code on response
  status(status) {
    // TODO: Validate status to make sure only allowed codes are used
    this.res.status = status;
    return this;
  }

  // CORS - Enables CORS on response
  cors() {
    this.res.headers['Access-Control-Allow-Origin'] = '*';
    return this;
  }

  // Headers - Adds headers to response
  headers(headers) {
    let self = this;
    for(i=0;i<Object.keys(headers).length;i++) {
      this.res.headers[Object.keys(headers)[i]] = headers[Object.keys(headers)[i]];
    }
    return this;
  }

  // Body - Adds body to response
  body(body) {
    this.res.body = body;
    return this;
  }

  // End - Returns response
  end() {
    const that = this;

    let response = {
      statusCode: that.res.status,
      body: typeof that.res.body !== 'string' ? JSON.stringify(that.res.body) : that.res.body,
      headers: that.res.headers
    };
    
    return that.cb(null, response);
  }
}

module.exports = Res;
