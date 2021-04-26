const { MongoClient, ObjectId, Collection } = require('mongodb');

// Reuse client connection
let mongoClient;

async function dbCollection(collection) {
  if (!mongoClient) {
    mongoClient = await MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true });
  }
  return (await mongoClient.db('recon')).collection(collection);
}

// Generic database pipeline processing
async function aggregateRecords(collection, pipeline) {
  try {
    let coll = await dbCollection('music');
    let records = await coll.aggregate(pipeline);

    return records.toArray();
  }
  catch (err) {
    console.warn(err);
    return [];
  }
}

// Generic object modification
// <collection, id, operation, optional: album>
async function modifyRecords(collection, op, id, upd = undefined) {
  try {
    let coll = await dbCollection('music');
    let _id = id && ObjectId(id);

    switch (op) {
      case "put": case "patch": {
        return await coll.findOneAndUpdate({ _id: _id }, { $set: upd }, { returnOriginal: false });
      }

      case "del": {
        return await coll.findOneAndDelete({ _id: _id }, { projection: { _id: 1 } });
      }

      case "new": {
        console.log("MRM: NEW");
        return await coll.insertOne(upd);
      }
    }

    throw "Unknown operation: " + op;
  }
  catch (err) {
    console.warn(err);
    return [];
  }
}


// Book specific fetching
async function fetchBooksMongo() {
  return aggregateRecords('library', [{ $match: {} }, { $sort: { volume: 1 }}]);
};

// Album specific fetching
async function fetchAlbumsMongo(id = undefined) {
  let match = id ? ({ _id: ObjectId(id) }) : ({});

  return aggregateRecords('music', [{ $match: match }, { $sort: { title: 1 }}]);
};

async function updateAlbumById(id, upd) {
  return modifyRecords('music', "patch", id, upd);
}

async function deleteAlbumById(id) {
  return modifyRecords('music', "del", id);
}

async function createAlbum(album) {
  return modifyRecords('music', "new", undefined, album);
}

module.exports = {
  fetchBooksMongo
}
