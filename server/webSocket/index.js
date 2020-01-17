const io = global.io;
const db = require('../db');

let clients = {};
let history = [];
let pc;

io.on('connection', socket => {
    console.log('new connection is open ...');

    socket.on('users:connect', data => {
        db.emit('user/getById', data.userId)
        .then(user => {
            pc = user.permission && user.permission.chat;
            if (!pc || !pc.R) return;

            clients[socket.id] = {
                username: data.username,
                socketId: socket.id,
                userId: data.userId,
                activeRoom: data.roomId
            };
            socket.emit('users:list', Object.values(clients));
            socket.broadcast.emit('users:add', clients[socket.id]);
        });
    });

    socket.on('message:add', data => {
        if (!pc || !pc.C) return;

        let rSocetId;
        for (let id in clients){
            if (clients[id].userId === data.recipientId){
                rSocetId = clients[id].socketId;
                break;
            }
        };

        if (rSocetId){
            io.to(rSocetId).emit('message:add', data);
            socket.emit('message:add', data);
            history.push(data);
        }
    });

    socket.on('message:history', data => {
        if (!pc || !pc.R) return;

        const messages = history.filter(item =>
            item.senderId === data.userId && item.recipientId === data.recipientId
            || item.senderId === data.recipientId && item.recipientId === data.userId
        );
        socket.emit('message:history', messages);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('users:leave', socket.id);
        delete clients[socket.id];
        console.log('disconnect');
    });
});