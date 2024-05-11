const BaseDB = require('./index')


class RoomDB extends BaseDB {
    constructor() {
        super();
        this.collection = this.database.collection('rooms')
    }

    createRoom = async (roomName, socketId) => {
        try {
            // 连接到 MongoDB
            await this.client.connect();
            console.log('Connected to MongoDB successfully!');

            // 插入数据
            const data = {
                roomName: roomName,
                numbers: [socketId]
            }
            const result = await this.collection.insertOne(data);
            console.log('Inserted data:', result.insertedId);

        } catch (error) {
            console.error('Error inserting data:', error);
        } finally {
            // 关闭连接
            await this.client.close();
        }
    }

    joinRoom = async (roomName, socketId) => {
        try {
            // 连接到 MongoDB
            await this.client.connect();
            const query = { roomName: roomName };
            // 从数据库判断该房间是否存在
            // 如果存在，修改房间
            // 如果不存在，报错
            // 查找数据
            const update = { $push: { numbers: socketId } };
            await this.collection.updateOne(query, update);
            // console.log("--result11--", result);
            // const result2 = await this.collection.find({}).toArray();
            // console.log("--result2--", result2);
        } catch (error) {
            console.error('Error joinRoom:', error);
        } finally {
            await this.client.close();
        }
    }


    leaveRoom = async (socketId) => {

    }

    getRooms = async () => {
        try {
            // 连接到 MongoDB
            await this.client.connect();
            const result = await this.collection.find({}).toArray()
            console.log("--result--", result);
            return result
        } catch (error) {
            console.error('Error joinRoom:', error);
        } finally {
            await this.client.close();
        }
    }

}


module.exports = RoomDB
