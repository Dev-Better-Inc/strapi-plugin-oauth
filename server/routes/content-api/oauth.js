module.exports = [
  {
    method: 'GET',
    path: '/oauth2',
    handler: 'oauthController.start',
    config: {
      auth: false,
      policies: [],
      middlewares: [
        {name: 'plugin::strapi-oauth.set-client'},
        {name: 'plugin::strapi-oauth.check-grant', config: {grant: 'authorization_code'}}
      ],
    },
  },
  {
    method: 'POST',
    path: '/oauth2/grant',
    handler: 'oauthController.grant',
    config: {
      policies: [],
      middlewares: [
        {name: 'plugin::strapi-oauth.set-client'},
        {name: 'plugin::strapi-oauth.check-grant', config: {grant: 'authorization_code'}}
      ],
    },
  },
  {
    method: 'GET',
    path: '/oauth2/code',
    handler: 'oauthController.code',
    config: {
      auth: false,
      policies: [],
      middlewares: [
        {name: 'plugin::strapi-oauth.set-client'},
        {name: 'plugin::strapi-oauth.check-grant', config: {grant: 'authorization_code'}}
      ],
    },
  },
  {
    method: 'POST',
    path: '/oauth2/token',
    handler: 'oauthController.token',
    config: {
      auth: false,
      policies: [],
      middlewares: [
        {name: 'plugin::strapi-oauth.set-client'},
        {name: 'plugin::strapi-oauth.check-grant', config: {grant: 'authorization_code'}}
      ],
    },
  },
  {
    method: 'POST',
    path: '/oauth2/test',
    handler: 'oauthController.test',
    config: {
      auth: false,
      policies: ['plugin::strapi-oauth.authenticate'],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/oauth2/refresh',
    handler: 'oauthController.refresh',
    config: {
      auth: false,
      policies: [{name: 'plugin::strapi-oauth.authenticate', config: {ignoreExpired: true}}],
      middlewares: [
        {name: 'plugin::strapi-oauth.set-client'},
        {name: 'plugin::strapi-oauth.check-grant', config: {grant: 'refresh_token'}}
      ],
    },
  }
];
