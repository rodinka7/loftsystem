const db = require('../../db');

module.exports = resp => {
    const _id = resp.data;

    db.emit('news/delete', _id)
    .then(data => {
        if (data.ok){
            db.emit('news/getAll')
            .then(data => resp.reply(data))
            .catch(err => resp.replyErr(err))
        } else {
            resp.replyErr({message: 'При удалении новости возникли ошибки!', status: 400});
        }
    })
    .catch(err => resp.replyErr(err))
};
