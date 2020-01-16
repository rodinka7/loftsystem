const jwt = require('jsonwebtoken');

module.exports.createTokens = user => {
    const token = jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: process.env.TOKEN_LIFE});
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_LIFE});

    return {
        accessToken: token,
        refreshToken: refreshToken,
        accessTokenExpiredAt: Date.now() + process.env.TOKEN_LIFE * 1000,
        refreshTokenExpiredAt: Date.now() + process.env.REFRESH_TOKEN_LIFE * 1000,
    };
};

module.exports.mongoDocToObject = (user, safe) => {
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
}