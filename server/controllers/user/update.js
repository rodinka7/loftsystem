const db = require('../../db');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);

const upload = process.env.UPLOAD;

function validate(fields, files){
    const schema = Joi.object().keys({
        surName: Joi.string().allow(''),
        firstName: Joi.string().allow(''),
        middleName: Joi.string().allow(''),
        avatar: Joi.string().allow(''),
        type: Joi.string().pattern(new RegExp('image/jpeg|image.jpg|image.png')).allow(''),
        size: Joi.number().allow(null),
        oldPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9.,/_-]{3,20}$')).allow(''),
        newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9.,/_-]{3,20}$')).allow('')
    });

    const avatar = files.avatar || {};

    return schema.validate({
        ...fields,
        type: avatar.type,
        size: avatar.size
    });
}

function updatePassword(user, fields){
    return new Promise((resolve, reject) => {
        if (!fields.oldPassword || !fields.newPassword){
            resolve();
        } else {
            bcrypt.hash(fields.oldPassword, user.salt, (err, hash) => {
                if (err || hash !== user.password){
                    console.log(err);
                    resolve();
                } else {
                    bcrypt.hash(fields.newPassword, user.salt, (err, hash) => {
                        if (err) console.log(err);
                        else fields.password = hash;
                        resolve();
                    });
                }
            });
        }
    });
}

module.exports = resp => {
    const form = new formidable.IncomingForm();
    const user = resp.data.user;
    form.uploadDir = upload;

    form.parse(resp.data, async (err, fields, files) => {
        if (err){
            response.replyErr(err);
        }

        const valid = validate(fields, files);
        const avatar = files.avatar;

        if (valid.error){
            if (avatar) unlink(avatar.path);
            console.log(valid.error);
            resp.replyErr({message: 'При загрузке данных на сервер произошла ошибка!'});
        } else {
            const image = avatar && avatar.name;

            if (image){
                try {
                    await rename(avatar.path, path.join(upload,image));
                } catch(err){
                    response.replyErr(err)
                }
            }

            try {
                await updatePassword(user, fields);
            } catch(err){
                console.log(err);
                resp.replyErr(err);
            }

            const data = {
                userId: user.id,
                fields
            };

            if (image)
                data.fields.image = path.join('./assets/img', image);

            db.emit('user/update', data)
            .then(response => {
                if (response.ok){
                    db.emit('user/get', {username: user.username})
                    .then(userData => resp.reply(userData))
                    .catch(err => resp.replyErr(err));
                } else {
                    resp.replyErr({message: 'При обновлении данных пользователя возникли ошибки!', status: 400});
                }
            })
            .catch(err => resp.replyErr(err));
        }
    });
}