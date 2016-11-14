'use strict';

// Req - Request Class
class Req {

  constructor(config) {
      // Declare universal properties
      this.stage = null;
      this.path = null;
      this.method =  null;
      this.headers = null;
      this.body = null;
      this.query = null;
      this.ip = null;
      this.host = null;
      this.userAgent = null;
      this.raw = null;
  }

  /**
  * Set
  * - Sets properties on the instance and enforces consistent use of null
  **/

  set (property, value) {
    this[property] = value ? value : null;
    return this[property];
  }
}

module.exports = Req;
