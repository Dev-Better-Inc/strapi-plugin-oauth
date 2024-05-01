'use strict';

/**
 * oauth-client service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('plugin::strapi-oauth.client', ({strapi}) => ({
  async findByClientId(clientId, args = {}) {
    const { results } = await this.find({
      filters: {clientId},
      ...args
    });

    if(results[0])
      return results[0];

    return null;
  }
}));
