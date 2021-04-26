const { MongoClient, ObjectId } = require('mongodb');

let mongoClient, coll;

module.exports = {
  wipe: {
    func: async () => {
      mongoClient = await MongoClient.connect(process.env.MONGODB_RW_URI, { useUnifiedTopology: true });
      coll = (await mongoClient.db('recon')).collection("music");
      await coll.deleteMany({});
      return await (await coll.find({})).count();
    },
    result: 0
  },
  fill: {
    func: async () => {
      if (!coll) return 0;
      await coll.insertMany([
        { '_id':ObjectId('607f0191b849a1b374ab9597'), 'title' : 'Workingman\'s Dead', 'band' : 'The Grateful Dead' },
        { '_id':ObjectId('607f0191b849a1b374ab9598'), 'title' : 'Aoxomoxoa',          'band' : 'The Grateful Dead' },
        { '_id':ObjectId('607f020fa563892026926b46'), 'title' : 'Wake of the Flood',  'band' : 'The Grateful Dead' }
      ]);
      return await (await coll.find({})).count();
    },
    result: 3
  },
  done: async () => {
    mongoClient.close();
  }
}
