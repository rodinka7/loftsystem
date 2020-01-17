const { EventEmitter } = require('@nauma/eventemitter');
const db = new EventEmitter('db');
const mongoose = require('mongoose');
const { mongoDocToObject } = require('../utils');
const {MONGO_LOCAL} = require('../config');

mongoose.Promise = global.Promise;

const User = require('./models/user');
const Token = require('./models/refreshToken');
const News = require('./models/news');

mongoose
  .set('useNewUrlParser', true)
  .set('useUnifiedTopology', true);

mongoose.connect(MONGO_LOCAL);

db.on('user/save', async resp => {
    try {
        const newUser = new User(resp.data);
        const user = await newUser.save();

        resp.reply(mongoDocToObject(user));
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('user/update', async resp => {
    const data = resp.data.fields;
    const _id = resp.data.userId;

    try {
        const response = await User.updateOne({_id}, {$set: data});
        resp.reply(response);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
})

db.on('user/get', async resp => {
    try {
        const user = await User.findOne({username: resp.data.username});
        resp.reply(mongoDocToObject(user, resp.data.safe));
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('user/delete', async resp => {
    try {
        const response = await User.deleteOne({_id: resp.data});
        resp.reply(response);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('user/getById', async resp => {
    try{
        const user = await User.findById(resp.data);
        resp.reply(mongoDocToObject(user));
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('user/getAll', async resp => {
    try{
        const users = await User.find();
        resp.reply(users.map(user => mongoDocToObject(user)));
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('token/get', async resp => {
    try{
        const token = await Token.findOne({token: resp.data});
        resp.reply(token);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('token/save', async resp => {
    try {
        const token = await Token.create(resp.data);
        resp.reply(token);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('token/delete', async resp => {
    try {
        await Token.deleteOne({token: resp.data});
        resp.reply({});
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('permission/update', async resp => {
    const { body, _id} = resp.data;

    try {
        const response = await User.updateOne({_id}, {$set: {permission: body}});
        resp.reply(response);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('news/getAll', async resp => {
    try{
        const news = await News.find();
        resp.reply(news.map(item => ({
            id: item._id,
            title: item.title,
            text: item.text,
            createdAt: item.createdAt,
            user: item.user
        })));
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('news/create', async resp => {
    try {
        const news = await News.create(resp.data);
        resp.reply(news);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('news/update', async resp => {
    const {body, _id} = resp.data;

    try {
        const response = await News.updateOne({_id}, {$set: body});
        resp.reply(response);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

db.on('news/delete', async resp => {
    try {
        const response = await News.deleteOne({_id: resp.data});
        resp.reply(response);
    } catch(err){
        console.log(err);
        resp.replyErr(err);
    }
});

module.exports = db;