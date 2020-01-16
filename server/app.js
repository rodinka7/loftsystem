const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { promisify } = require('util');

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

require('dotenv').config();

const app = express();

const routes = require('./routes');
const db = require('./db');
const upload = process.env.UPLOAD;

const loggerFile = fs.createWriteStream('logFile.log', {flag: 'a'});
app.use(logger('combined', {stream: loggerFile}));

app.use(express.static(path.join(__dirname, '../build')));

app.use(helmet());

app.use(express.json({limit: '2048kb'}));
app.use(express.urlencoded({extended: false, limit: 10000}));

app.use(cookieParser());

app.use(
    session({
        store: new FileStore(),
        secret: process.env.SESSION_SECRET,
        key: process.env.SESSION_KEY,
        resave: false,
        saveUninitialized: true
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({message: err.message});
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.emit('user/getById', id)
    .then(user => {
        const _user = user && `${user.id}` === id ? user : false;
        done(null, _user);
    })
    .catch(err => console.log(err));
});

passport.use(
    new LocalStrategy(
        (username, password, done) => {
            db.emit('user/get', {username, safe: true})
            .then(user => {
                bcrypt.hash(password, user.salt, (err, hash) => {
                    if (err){
                        console.log(err);
                        return;
                    }

                    if (hash === user.password && username === user.username){
                        // const {_id, username, surName, firstName, middleName, image } = user;
                        return done(null, user);
                    }

                    return done(null, false);
                });
            })
            .catch(err => console.log(err));
        }
    )
);

const server = app.listen(process.env.PORT, async () => {
    try {
        await access(upload);
    } catch(err){
        await mkdir(upload);
    }

    console.log(`Сервер запущен на порту ${server.address().port}`);
});