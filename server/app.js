const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { promisify } = require('util');

const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

const {SESSION_SECRET, SESSION_KEY, PORT, UPLOAD} = require('./config');

const app = express();
const server = http.createServer(app);

global.io = require('socket.io').listen(server);

const routes = require('./routes');
const db = require('./db');
require('./webSocket');

const loggerFile = fs.createWriteStream('logFile.log', {flag: 'a'});
app.use(logger('combined', {stream: loggerFile}));

app.use(express.static(path.resolve('build')));
app.use(helmet());

// app.use(express.json({limit: '2048kb'}));
// app.use(express.urlencoded({extended: false, limit: 10000}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser());

app.use(
    session({
        store: new FileStore(),
        secret: SESSION_SECRET,
        key: SESSION_KEY,
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
                if (!user) return done(null, false);

                bcrypt.hash(password, user.salt, (err, hash) => {
                    if (err) return console.log(err);

                    if (hash === user.password && username === user.username)
                        return done(null, user);

                    return done(null, false);
                });
            })
            .catch(err => console.log(err));
        }
    )
);

server.listen(PORT, async () => {
    try {
        await access(UPLOAD);
    } catch(err){
        await mkdir(UPLOAD);
    }

    console.log(`Сервер запущен на порту ${server.address().port}`);
});