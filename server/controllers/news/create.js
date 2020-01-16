const db = require('../../db');
const Joi = require('@hapi/joi');

module.exports = resp => {
    const {body, user} = resp.data;

    const schema = Joi.object().keys({
        title: Joi.string().required(),
        text: Joi.string().required()
    });

    const {title, text} = body;
    const result = schema.validate({title, text});

    if (result.error) {
        console.log(result.error);
        resp.replyErr({message: 'Заполните название и текст новости!', status: 400});
        return;
    }

    body.user = {
        ...user,
        createdAt: new Date()
    };

    delete body.user.permission;

    db.emit('news/create', body)
    .then(data => {
        db.emit('news/getAll')
        .then(data => resp.reply(data))
        .catch(err => resp.replyErr(err))
    })
    .catch(err => resp.replyErr(err))
}