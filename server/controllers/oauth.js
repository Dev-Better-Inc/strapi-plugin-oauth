'use strict';

/**
 * A set of functions called "actions" for `oauth-test`
 */
//TODO: update the pkce-challenge after migrate to TS
const {randomBytes, createHash} = require("crypto");

module.exports = ({strapi}) => ({
  start: async (ctx, next) => {
    try {
      const code = await strapi
        .plugin('strapi-oauth')
        .service('authorization-code')
        .create({
          data: {
            client: ctx.oauth.client.id,
          }
        });

      const {writeKey, readKey} = await strapi
        .plugin('strapi-oauth')
        .service('authorization-code')
        .refreshTokens(code.id)

      ctx.body = {write_key: writeKey, read_key: readKey};
    } catch (err) {
      ctx.body = err;
    }
  },

  grant: async (ctx, next) => {
    const {state, code_challenge} = ctx.request.body;
    const {user} = ctx.state;
    try {
      const code = await strapi
        .plugin('strapi-oauth')
        .service('authorization-code')
        .findOneByClient(ctx.oauth.client.id, {writeKey: state});

      if(!code)
        return ctx.notFound('The code does not exists');

      if(code.writeKeyUsedAt)
        return ctx.badRequest('This request was expired');

      if(code){
        const authorizationCode = randomBytes(20).toString('hex');
        const codeChallenge = createHash('sha256').update(code_challenge).digest('base64')
        await strapi
          .plugin('strapi-oauth')
          .service('authorization-code')
          .update(code.id, {data: {
            authorizationCode,
            codeChallenge,
            writeKeyUsedAt: new Date(),
            user: user.id
          }})
      }

      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  },

  code: async (ctx, next) => {
    const {state} = ctx.query;
    try {
      const code = await strapi
        .plugin('strapi-oauth')
        .service('authorization-code')
        .findOneByClient(ctx.oauth.client.id, {readKey: state});

      if(!code)
        return ctx.notFound('The code does not exists');

      if(code.readKeyUsedAt)
        return ctx.badRequest('This request was expired');

      if(!code.writeKeyUsedAt){
        ctx.status = 202;
        return;
      }

      await strapi
        .plugin('strapi-oauth')
        .service('authorization-code')
        .update(code.id, {data: {
          readKeyUsedAt: new Date()
        }});
      ctx.body = {access_grant: code.authorizationCode};

    } catch (err) {
      ctx.body = err;
    }
  },

  token: async (ctx, next) => {
    const {code, code_verifier} = ctx.request.body;
    try {
      const {accessToken, refreshToken} = await strapi
        .plugin('strapi-oauth')
        .service('authorization-code')
        .exchangeToAccessToken(ctx.oauth.client.id, code, code_verifier)

      ctx.body = {access_token: accessToken, refresh_token: refreshToken};
    } catch (err) {
      ctx.body = err;
    }
  },

  refresh: async (ctx, next) => {
    const {access_token, refresh_token} = ctx.request.body;
    try {
      const token = await strapi
        .plugin('strapi-oauth')
        .service('token')
        .findOneByClient(ctx.oauth.client.id, {accessToken: access_token, refreshToken: refresh_token})

      if(!token)
        return ctx.notFound('The token does not exists');

      const {accessToken, refreshToken} = await strapi
        .plugin('strapi-oauth')
        .service('token')
        .refreshTokens(token.id);

      ctx.body = {access_token: accessToken, refresh_token: refreshToken};

    } catch (err) {
      ctx.body = err;
    }
  },

  test: async (ctx, next) => {
    try {
      ctx.body = 'Some data';
    } catch (err) {
      ctx.body = err;
    }
  }
});
