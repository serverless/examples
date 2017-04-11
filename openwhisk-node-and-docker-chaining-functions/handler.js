'use strict';

/* eslint-disable import/no-extraneous-dependencies */

const request = require('request');

function http(url, qs) {
  const options = {
    url, qs, json: true,
  };

  return new Promise((resolve, reject) => {
    request(options, (err, resp) => {
      if (err) {
        console.log(err);
        return reject({ err });
      }
      if (resp.body.status !== 'OK') {
        console.log(resp.body.status);
        return reject({ err: resp.body.status });
      }

      return resolve(resp.body);
    });
  });
}

function locationFromAddress(params) {
  if (!params.address) return Promise.reject('Missing mandatory property: address');

  return http('https://maps.googleapis.com/maps/api/geocode/json', { address: params.address });
}

function sunriseSunset(params) {
  if (!params.lat) return Promise.reject('Missing mandatory property: lat');
  if (!params.lng) return Promise.reject('Missing mandatory property: lng');

  return http('http://api.sunrise-sunset.org/json', { lat: params.lat, lng: params.lng });
}

module.exports.locationFromAddress = locationFromAddress;
module.exports.sunriseSunset = sunriseSunset;
