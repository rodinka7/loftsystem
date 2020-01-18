const db = require('../../db');

module.exports = resp => {
    db.emit('news/getAll')
    .then(data => resp.reply(data))
    .catch(err => resp.replyErr(err))
}