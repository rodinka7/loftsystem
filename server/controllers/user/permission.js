const db = require('../../db');

module.exports = resp => {
    const { body, _id } = resp.data;

    db.emit('permission/update', {body, _id})
    .then(data => {
        if (data.ok)
            resp.reply(data);
        else
            resp.replyErr({message: 'При обновлении данных пользователя возникли ошибки!', status: 400});
    })
    .catch(err => resp.replyErr(err));
}