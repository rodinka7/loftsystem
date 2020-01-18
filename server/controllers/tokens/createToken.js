const {createTokens} = require('../../utils');
const db = require('../../db');

module.exports = resp => {
    const tokens = createTokens(resp.data);

    db.emit('token/save', {token: tokens.refreshToken})
    .then(() => resp.reply(tokens))
    .catch(err => resp.replyErr(err));
}