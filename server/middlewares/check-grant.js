'use strict';

/**
 * `set-client` middleware
 */

const {chain, trim} = require('lodash');
module.exports = (config, { strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const {grant} = config;
    if(grant){
      const grantAllowed = !!chain(ctx).get('oauth.client.grants').split(',').map(item => trim(item))
        .includes(grant).value();
      if(!grantAllowed)
        return ctx.badRequest(`The ${grant} grant is not allowed for this client`);
    }

    await next();
  };
};
