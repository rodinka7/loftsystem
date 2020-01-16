const Joi = require('@hapi/joi');
const db = require('../../db');

module.exports = resp => {
    const schema = Joi.object().keys({
        username: Joi.string().required(),
        surName: Joi.string().allow(''),
        firstName: Joi.string().allow(''),
        middleName: Joi.string().allow(''),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9.,/_-]{3,20}$')).required()
    });

    const result = schema.validate(resp.data);
    if (result.error) {
        console.log(result.error);
        resp.replyErr({message: 'Заполните обязательные поля формы!', status: 400});
        return;
    }

    const username = resp.data.username;
    db.emit('user/get', {username})
    .then(user => {
        if (user && user.username === username){
            resp.replyErr({message: `Пользователь с именем ${username} уже существует!`, status: 400})
            return;
        }

        db.emit('user/save', resp.data)
        .then(response => {
            const { _id, username, surName, firstName, middleName } = response;
            resp.reply({ _id, username, surName, firstName, middleName });
        })
        .catch(err => resp.replyErr(err));
    })
    .catch(err => resp.replyErr(err));
}