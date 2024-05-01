'use strict';

const {createHash, randomBytes} = require("crypto");
const {generateChallenge} = require("pkce-challenge");
/**
 *  service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const HASHED_FIELDS = ['readKey', 'writeKey'];
const TOKENS_SIZE = 20;
module.exports = createCoreService('plugin::strapi-oauth.authorization-code', ({strapi}) => ({
  async findOneByClient(clientId, conds, populate = {}) {
    for (const field in conds) {
      if(HASHED_FIELDS.includes(field))
        conds[field] = createHash('sha256').update(conds[field]).digest('base64')
    }
    const {results} = await this.find({
        filters: {client: {id: clientId}, ...conds},
        populate
      });

    return results[0] || null;
  },

  async refreshTokens(id) {

    const writeKey = randomBytes(TOKENS_SIZE).toString('hex');
    const writeKeyHash = createHash('sha256').update(writeKey).digest('base64');

    const readKey = randomBytes(TOKENS_SIZE).toString('hex');
    const readKeyHash = createHash('sha256').update(readKey).digest('base64');
    await this.update(id, {
      data: {
        writeKey: writeKeyHash,
        readKey: readKeyHash,
        writeKeyUsedAt: null,
        readKeyUsedAt: null
      },
    });

    return {writeKey, readKey}
  },

  async exchangeToAccessToken(clientId, authorizationCode, codeVerifier){
    const code = await this
      .findOneByClient(clientId, {authorizationCode}, ['user', 'client']);

    if(!code)
      throw new Error('The code does not exists');

    let codeChallenge = generateChallenge(codeVerifier);
    codeChallenge = createHash('sha256').update(codeChallenge).digest('base64');
    if(code.codeChallenge !== codeChallenge)
      throw new Error('The code does not exists');

    const token = await strapi
      .plugin('strapi-oauth')
      .service('token')
      .create({
        data: {
          client: code.client.id,
          user: code.user.id
        },
      });
    const {accessToken, refreshToken} = await strapi
      .plugin('strapi-oauth')
      .service('token')
      .refreshTokens(token.id);

    await this.delete(code.id);
    return {accessToken, refreshToken};
  }
}));
