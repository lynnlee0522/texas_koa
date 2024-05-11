const Koa = require('koa');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const CardController = require('./controller/card')
const RoomController = require('./controller/room')
const RoomDB = require('./mongodb/room')
const cors = require('koa2-cors');
const userRouter = require('./router/rooms');

const app = new Koa();
const httpServer = createServer(app.callback());

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

const roomdb = new RoomDB();

io.on('connection', (socket) => {
    // 监听连接断开事件
    socket.on('disconnect', () => {
        console.log('rooms--', socket.roooms);
        console.log('User disconnected');
        // 在这里可以执行一些清理操作或其他逻辑
    });

    const rc = new RoomController(io);
    const rooms = rc.getRooms()
    console.log("---rooms---", rooms);

    // Todo: 监听客户端创建房间的事件

    // 监听客户端加入房间的事件
    socket.on('joinRoom', async (roomName, callback) => {
        socket.join(roomName);
        callback(roomName);
        await roomdb.joinRoom(roomName, socket.id)
    });

    socket.on('createRoom', async (roomName, callback) => {
        socket.join(roomName);
        callback(roomName);
        await roomdb.createRoom(roomName, socket.id)
    });

    socket.on('licensing', async (roomName) => {
        const manager = new CardController(io, roomName)
        manager.start();
    });

});

app.use(cors())
app.use(userRouter.routes());
app.use(userRouter.allowedMethods());


httpServer.listen(8000, () => {
    console.log("koa 服务器启动成功");
});