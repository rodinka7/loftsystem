const express = require('express');
const router = express.Router();
const passport = require('passport');
const ctrl = require('../controllers');

const fs = require('fs');
const path = require('path');

const {checkUserPermissions} = require('../utils');

// const { promisify } = require('util');

// const readFile = promisify(fs.readFile);

// const React = require('react');
// const ReactDomServer = require('react-dom/server');
// const { createStore } = require('redux');

// const App = require('../../src');

function isAuthenticated(req, res, next){
     if (req.isAuthenticated()){
        next();
    } else {
        res.status(403).send({message: 'Доступ запрещен!'});
    }
}

function checkPermissions(req, res, next){
    const { url, method, user } = req;
    if (checkUserPermissions(url, method, user)){
        next();
    } else {
        res.status(403).send({message: 'Доступ запрещен!'});
    }
}

router.get('/', (req, res, next) => {
    // try {
    //     const data = await readFile(path.join('../../build/index.html', 'utf-8'));
    //     res.send(
    //         data.replace(
    //             `<div id="root"></div>`,
    //             `<div id="root">${ReactDomServer.renderToString(<App />)}</div>`,
    //         )
    //     );
    // } catch(err){
    //     console.log(err);
    //     res.status(500).send('The error is occured while loading sourse!');
    // }
    res.render('index');
});

router.post('/api/registration', (req, res) => {
    ctrl.emit('/api/registration', req.body)
    .then(resp => res.send(resp))
    .catch(err => res.status(err.status || 500).send(err));
});

router.post('/api/login', (req, res, next) => {
    ctrl.emit('/api/login', req.body)
    .then(user => {
        passport.authenticate('local', (error, user, info) => {
            if (error){
                console.log(error);
                return res.status(error.status || 500).send(error);
            }

            if (!user){
                return res.status(400).send({message: `Укажите правильное имя пользователя и пароль!`, status: 400});
            }

            req.login(user, err => {
                if (err){
                    console.log(err);
                    res.status(err.status || 500).send(err);
                }

                ctrl.emit('token/create', user)
                .then(data => {
                    res.header('authorization', data.refreshToken);
                    res.status(200).send({...user, ...data});
                })
                .catch(err => res.status(500).send(err));
            });
        })(req, res, next);
    })
    .catch(err => res.status(err.status || 500).send(err));
});

router.post('/api/refresh-token', isAuthenticated, (req, res, next) => {
    ctrl.emit('token/refresh', req)
    .then(data => {
        res.header('Authorization', data.refreshToken);
        res.status(200).send(data);
    })
    .catch(err => res.status(err.status || 500).send(err));
});

router.get('/api/profile', isAuthenticated, (req, res, next) => {
    res.status(200).send(req.user);
});

router.patch('/api/profile', isAuthenticated, (req, res, next) => {
    ctrl.emit('user/update', req)
    .then(data => res.status(200).send(data))
    .catch(err => res.status(500).send(err));
});

router.get(
    '/api/users',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        ctrl.emit('user/getAll')
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
);

router.delete(
    '/api/users/:id',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        ctrl.emit('user/delete', req.params.id)
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
)

router.patch(
    '/api/users/:id/permission',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        const id = req.params.id;
        ctrl.emit('permission/update', {
            body: req.body.permission,
            _id: id
        })
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
);

router.get(
    '/api/news',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        ctrl.emit('news/getAll')
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
);

router.post(
    '/api/news',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        ctrl.emit('news/create', {
            body: req.body,
            user: req.user
        })
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
);

router.patch(
    '/api/news/:id',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        const _id = req.params.id;
        ctrl.emit('news/update', {
            body: req.body,
            _id
        })
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
);

router.delete(
    '/api/news/:id',
    isAuthenticated,
    checkPermissions,
    (req, res, next) => {
        ctrl.emit('news/delete', req.params.id)
        .then(data => res.status(200).send(data))
        .catch(err => res.status(err.status || 500).send(err));
    }
);

module.exports = router;