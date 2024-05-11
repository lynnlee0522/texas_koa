const CollectionRoom = require('../mongodb/index')

const rm = new CollectionRoom();

const resolvers = {
    Query: {
        async rooms(_, args, context) {
            //   let collection = await db.collection("records");
            //   const records = await collection.find({}).toArray();
            await rm.connect();
            const records = await rm.collection.find({}).toArray();
            return records;
        },
    },
};

module.exports = resolvers