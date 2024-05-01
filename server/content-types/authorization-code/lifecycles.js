const {randomBytes, createHash} = require("crypto");

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;

    if(data.writeKey)
      event.params.data.writeKey = createHash('sha256').update(data.writeKey).digest('base64');

    if(data.readKey)
      event.params.data.readKey = createHash('sha256').update(data.readKey).digest('base64');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);
    event.params.data.expiresAt = expiresAt;
  },
};
