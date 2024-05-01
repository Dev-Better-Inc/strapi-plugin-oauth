'use strict';

/**
 * `set-client` middleware
 */

const {chain} = require('lodash');
module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const {method} = ctx.request;

    const scope = ('get' === method.toLowerCase()) ? 'query' : 'body';
    const {client_id} = ctx.request[scope];

    if(!client_id)
      return ctx.badRequest("You must provide the client id for this request");

    const client = await strapi
      .plugin('strapi-oauth')
      .service('client')
      .findByClientId(client_id);
    console.log(client)
    if(!client)
      return ctx.badRequest("The Client does not exists");

    ctx.oauth = {client};
    await next();
  };
};
