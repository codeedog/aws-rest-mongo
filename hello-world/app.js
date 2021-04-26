/* REST <=> CRUD
 *
 * Convert the six HTTP actions for a REST API into a CRUD ops on Mongo DB.
 * Reuse Album collection from Recon Website work.
 */

const { MongoClient, ObjectId, Collection } = require('mongodb');

// Stash client connection for reuse
let mongoClient;
process.env.MONGODB_URI = "--SNIP--";

// Wrap automatic connection establishment or return existing connection
async function dbCollection(collection) {
  if (!mongoClient) {
    mongoClient = await MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true });
  }
  return (await mongoClient.db('recon')).collection(collection);
}


/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
  try {
    console.log("request:   ", JSON.stringify(event));

    // Get Music Collection && setup query for _id matching (if exists)
    const coll = await dbCollection('music');
    const match = event.pathParameters ? ({ _id: ObjectId(event.pathParameters._id)}) : {};

    // Convert the body to an Album, present
    // handle application/json | x-www-form-urlencoded
    // Content-Type may be camel case or lowercase
    let album;
    switch (event.body && (event.headers["Content-Type"] || event.headers["content-type"])) {
      case "application/json": {
        album = JSON.parse(event.body);
        break;
      }
      case "application/x-www-form-urlencoded": {
        let k,v;
        console.log("X-WWW", `'${event.body}'`)
        album = event.body.split("&").reduce((p,pair) => ([k,v] = pair.split("="), p[k]=v, p), ({}));
        break;
      }
    }

    // Which HTTP Method brought us here? Take appropriate action
    switch (event.httpMethod) {
      case "GET": {
        let records = await coll.aggregate([{ $match: match }, { $sort: { title: 1 }}]);
        return { statusCode: 200, body: JSON.stringify(await records.toArray()) };
      }

      case "POST": {
        let ret = await coll.insertOne(album);

        if (ret.insertedCount == 1) {
          return { statusCode: 200, body: JSON.stringify({ message: 'POST album', album: ret.ops[0] }) };
        } else {
          return { statusCode: 500, body: JSON.stringify({ message: 'POST Failed' }) };
        }
      }

      case "PATCH":
      case "PUT": {
        const method = event.httpMethod;
        if (!match._id) {
          throw `${method}: missing '_id'`;
        }

        let ret = await coll.findOneAndUpdate(match, { $set: album }, { returnOriginal: false });

        if (ret.ok == 1 && ret.value) {
          return { statusCode: 200, body: JSON.stringify({ message: `${method} album change`, album: ret.value }) };
        } else {
          return { statusCode: 500, body: JSON.stringify({ message: `${method} Failed` }) };
        }
      }

      case "DELETE": {
        if (!match._id) {
          throw `DELETE: missing '_id'`;
        }

        let ret = await coll.findOneAndDelete(match, { projection: { _id: 1 } });

        if (ret.ok == 1 && ret.value) {
          return { statusCode: 200, body: JSON.stringify({ message: 'DELETE album', album: ret.value }) };
        } else {
          return { statusCode: 404, body: JSON.stringify({ message: 'DELETE Failed' }) };
        }
      }

      default: {
        // Unknown http method
        throw `Unknown HTTP Verb: ${event.httpMethod}`
      }
    }
  }
  catch (err) {
    console.warn(err);
    return {
      'statusCode': 403,
      'body': JSON.stringify({ err })
    };
  }
};

exports.cleanUp = async () => {
  mongoClient.close();
}
