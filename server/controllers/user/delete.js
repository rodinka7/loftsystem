const db = require('../../db');

module.exports = resp => {
    const _id = resp.data;

    db.emit('user/delete', _id)
    .then(data => resp.reply(data))
    .catch(err => resp.replyErr(err))
};
