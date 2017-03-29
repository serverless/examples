'use strict';

const request = require('request')

function http (url, qs) {
  const options = {
    url, qs, json: true
  }

  return new Promise(function (resolve, reject) {
    request(options, function (err, resp) {
      if (err) {
        console.log(err)
        return reject({err: err})
      }
      if (resp.body.status !== 'OK') {
        console.log(resp.body.status)
        return reject({err: resp.body.status})
      }

      resolve(resp.body)
    })
  })
}

function location_from_address (params) {
  if (!params.address) return Promise.reject('Missing mandatory property: address')

  return http('https://maps.googleapis.com/maps/api/geocode/json', {address: params.address})
}

function sunrise_sunset (params) {
  if (!params.lat) return Promise.reject('Missing mandatory property: lat')
  if (!params.lng) return Promise.reject('Missing mandatory property: lng')

  return http('http://api.sunrise-sunset.org/json', {lat: params.lat, lng: params.lng})
}

module.exports.location_from_address = location_from_address
module.exports.sunrise_sunset = sunrise_sunset
