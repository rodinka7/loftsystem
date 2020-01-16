const db = require('../../db');

module.exports = resp => {
    db.emit('user/getAll')
    .then(users => resp.reply(users))
    .catch(err => resp.replyErr(err));
}