const oauthRoutes = require('./oauth')
module.exports = {
  type: 'content-api',
  routes: [...oauthRoutes],
};
