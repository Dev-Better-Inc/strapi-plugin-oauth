'use strict';
/**
 * oauth-token service
 */
const {randomBytes, createHash} = require("crypto");
const {generateChallenge} = require("pkce-challenge");
const { createCoreService } = require('@strapi/strapi').factories;

const ACCESS_TOKEN_SIZE = 32;
const REFRESH_TOKEN_SIZE = 32;

const ACCESS_TOKEN_LIFETIME = 3;
const REFRESH_TOKEN_LIFETIME = 14;

const HASHED_FIELDS = ['accessToken', 'refreshToken'];

module.exports = createCoreService('plugin::strapi-oauth.token', ({strapi}) => ({
  async refreshTokens(id) {

    const accessToken = randomBytes(ACCESS_TOKEN_SIZE).toString('hex');
    const accessTokenHash = createHash('sha256').update(accessToken).digest('base64');

    const refreshToken = randomBytes(REFRESH_TOKEN_SIZE).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('base64');

    const accessTokenExpiresAt = new Date();
    accessTokenExpiresAt.setDate(accessTokenExpiresAt.getDate() + ACCESS_TOKEN_LIFETIME);

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + REFRESH_TOKEN_LIFETIME);
    await this.update(id, {
        data: {
          accessToken: accessTokenHash,
          refreshToken: refreshTokenHash,
          accessTokenExpiresAt,
          refreshTokenExpiresAt
        },
      });

    return {accessToken, refreshToken}
  },

  async findOneByClient(clientId, conds){
    for (const field in conds) {
      if(HASHED_FIELDS.includes(field))
        conds[field] = createHash('sha256').update(conds[field]).digest('base64')
    }
    const {results} = await this.find({
        filters: {client: {id: clientId}, ...conds}
      });

    return results[0] || null;
  },

  async validate(token, options){
    if(!token)
      return false;

    const {ignoreExpired} = options;

    const accessTokenHash = createHash('sha256').update(token).digest('base64');

    const {results} = await this
      .find({
        filters: {accessToken: accessTokenHash}
      });

    const accessToken = results[0];
    if(!accessToken)
      return false;

    if(ignoreExpired)
      return true;

    return new Date(accessToken.accessTokenExpiresAt) >= Date.now();
  }
}));
