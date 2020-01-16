const db = require('../../db');
const jwt = require('jsonwebtoken');
const {createTokens} = require('../../utils');

function createNewToken(resp){
    const tokens = createTokens(resp.data.user);
    db.emit('token/save', {token: tokens.refreshToken})
    .then(() => resp.reply(tokens))
    .catch(err => resp.replyErr(err));
}

module.exports = resp => {
    const refreshToken = resp.data.header('authorization');
    const error = {message: 'InvalidRequest', status: 404};

    if (!refreshToken){
        resp.replyErr(error);
    }

    db.emit('token/get', refreshToken)
    .then(data => {
        if (!data){
            resp.replyErr(error);
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            db.emit('token/delete', refreshToken)
            .then(() => {
                if (err){
                    console.log(err);
                    resp.reply({message: 'Срок авторизации закончился!', status: 401})
                } else {
                    createNewToken(resp);
                }
            })
            .catch(err => resp.replyErr(err));
        })
    })
    .catch(err => resp.replyErr(err));
}