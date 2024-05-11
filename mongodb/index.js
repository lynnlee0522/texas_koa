const { MongoClient } = require('mongodb');

// MongoDB 连接字符串
const uri = 'mongodb://localhost:27017'; // MongoDB 默认端口号为 27017

class BaseDB {
    constructor() {
        this.client = new MongoClient(uri);
        this.database = this.client.db('texas');
    }

    connect = async () => {
        try {
            await this.client.connect();
        } catch (error) {
            console.log(error);
        }
    }
}

class CollectionRoom extends BaseDB {
    constructor() {
        super();
        this.collection = this.database.collection('rooms')
    }
}

module.exports = CollectionRoom