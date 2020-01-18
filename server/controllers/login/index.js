const Joi = require('@hapi/joi');
const db = require('../../db');

module.exports = resp => {
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9.,/_-]{3,20}$')).required()
    });

    const result = schema.validate(resp.data);
    if (result.error) {
        console.log(result.error);
        resp.replyErr('error', `Введите логин и пароль!`);
    }

    const username = resp.data.username;

    db.emit('user/get', {username})
    .then(user => {
        if (!user){
            resp.replyErr({message: `Пользователь с именем ${username} не найден!`, status: 400});
            return;
        }
        resp.reply(user);
    })
    .catch(err => resp.replyErr(err));
}