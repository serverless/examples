const mongoose = require('mongoose');
const validator = require('validator');

const model = mongoose.model('User', {
  name: {
    type: String,
    required: true,
    validate: {
      validator(name) {
        return validator.isAlphanumeric(name);
      },
    },
  },
  firstname: {
    type: String,
    required: true,
    validate: {
      validator(firstname) {
        return validator.isAlphanumeric(firstname);
      },
    },
  },
  birth: {
    type: Date,
    required: true,
  },
  city: {
    type: String,
    required: true,
    validate: {
      validator(city) {
        return validator.isAlphanumeric(city);
      },
    },
  },
  ip: {
    type: String,
    required: true,
    validate: {
      validator(ip) {
        return validator.isIP(ip);
      },
    },
  },
});

module.exports = model;
