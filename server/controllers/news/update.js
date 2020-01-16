const db = require('../../db');
const Joi = require('@hapi/joi');

module.exports = resp => {
    const schema = Joi.object().keys({
        title: Joi.string().required(),
        text: Joi.string().required()
    });

    const {title, text} = resp.data.body;
    const result = schema.validate({title, text});

    if (result.error) {
        console.log(result.error);
        resp.replyErr({message: 'Заполните название и текст новости!', status: 400});
        return;
    }

    db.emit('news/update', resp.data)
    .then(data => {
        if (data.ok){
            db.emit('news/getAll')
            .then(data => resp.reply(data))
            .catch(err => resp.replyErr(err))
        } else {
            resp.replyErr({message: 'При обновлении новости возникли ошибки!', status: 400});
        }
    })
    .catch(err => resp.replyErr(err))
}