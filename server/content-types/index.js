'use strict';
const client = require('./client');
const authorizationCode = require('./authorization-code');
const token = require('./token');
module.exports = {
  client,
  "authorization-code": authorizationCode,
  token
};
