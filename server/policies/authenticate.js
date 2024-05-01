'use strict';

/**
 * `authenticate` policy
 */

module.exports = async (policyContext, config, { strapi }) => {
  const {access_token} = policyContext.request.body;
  const {ignoreExpired = false} = config;

  const isValid = await strapi
    .plugin('strapi-oauth')
    .service('token')
    .validate(access_token, {ignoreExpired});

  return isValid;
};
