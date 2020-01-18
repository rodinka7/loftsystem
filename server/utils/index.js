const jwt = require('jsonwebtoken');
const db = require('../db');
const {TOKEN_SECRET, REFRESH_TOKEN_SECRET, TOKEN_LIFE, REFRESH_TOKEN_LIFE } = require('../config');

module.exports.createTokens = user => {
    if (!user) return;
    const token = jwt.sign(user, TOKEN_SECRET, {expiresIn: TOKEN_LIFE});
    const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_LIFE});

    return {
        accessToken: token,
        refreshToken: refreshToken,
        accessTokenExpiredAt: Date.now() + TOKEN_LIFE * 1000,
        refreshTokenExpiredAt: Date.now() + REFRESH_TOKEN_LIFE * 1000,
    };
};

module.exports.mongoDocToObject = (user, safe) => {
    if (!user) return;

    const modified =  {
        id: user._id,
        username: user.username,
        surName: user.surName,
        firstName: user.firstName,
        middleName: user.middleName,
        image: user.image,
        permission: user.permission
    };

    if (safe) {
        modified.salt = user.salt;
        modified.password = user.password;
    }

    return modified;
};

module.exports.checkUserPermissions = (url, method, user) => {
    if (!user.permission) return false;

    const pp = user.permission;

    if (url.indexOf('users') !== -1){
        if (!pp.settings) return false;
        if (method === 'GET' && pp.settings.R
            || method === 'PATCH' && pp.settings.U
            || method === 'DELETE' && pp.settings.D)
                return true;
    }

    if (url.indexOf('news') !== -1){
        if (!pp.news) return false;
        if (method === 'GET' && pp.news.R
            || method === 'PATCH' && pp.news.U
            || method === 'DELETE' && pp.news.D
            || method === 'POST' && pp.news.C)
                return true;
    }
};