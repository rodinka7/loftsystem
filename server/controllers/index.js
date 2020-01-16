const { EventEmitter } = require('@nauma/eventemitter');
const ctrl = new EventEmitter('ctrl');

ctrl.on('/api/registration', require('./register'));
ctrl.on('/api/login', require('./login'));

ctrl.on('token/refresh', require('./tokens/refreshToken'));
ctrl.on('token/create', require('./tokens/createToken'));

ctrl.on('user/update', require('./user/update'));
ctrl.on('user/getAll', require('./user/get'));
ctrl.on('user/delete', require('./user/delete'));

ctrl.on('permission/update', require('./user/permission'));

module.exports = ctrl;