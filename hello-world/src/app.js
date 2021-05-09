/* REST <=> CRUD
 *
 * Convert the six HTTP actions for a REST API into a CRUD ops on Mongo DB.
 * Reuse Album collection from Recon Website work.
 */

process.env.SSM_PATH = '/recon/';

const { SSMClient, SSM, GetParameters } = require("@aws-sdk/client-ssm");
const { MongoClient, ObjectId, Collection } = require('mongodb');
const axios = require('axios').default;

const TRIGGER     = `${process.env.SSM_PATH}TRIGGER`;
const MDB_MGR_URI = `${process.env.SSM_PATH}MDB_MGR_URI`;

// SSM provides access to secure connection uri from within AWS process
// If ourside AWS process, initialize this module with it (e.g. from .env)

let awsParams;

async function getAwsParameter(param) {
  if (!awsParams) {
    // Get parameters from Security Storage
    const client = new SSM({ region: process.env.REGION });
    const data = await client.getParametersByPath({ Path: process.env.SSM_PATH, WithDecryption: true });

    awsParams = data.Parameters.reduce((p,v) => (p[v.Name] = v.Value, p), {});
    if (process.env.DEBUG) console.log({awsParams})
  }
  return awsParams[param];
}


// MongoClient provides access to mongodB
// Cache mongoDB client connection and connection uri
let mongoClient, mdb_uri;

// Wrap automatic connection establishment or return existing connection
async function dbCollection(collection) {
  if (!mdb_uri) {
    try {
      mdb_uri = await getAwsParameter(MDB_MGR_URI)
      // Fetch mongodb connection string from Security Storage
      /*const params = { Names: [ 'MDB_URI' ], WithDecryption: true };
      const client = new SSM({ region: process.env.REGION });
      const data = await client.getParameters(params);
      const vars = data.Parameters.reduce((p,v) => (p[v.Name] = v.Value, p), {});
      mdb_uri = vars.MDB_URI;*/
    }
    catch (err) {
      console.log("SSM init error:", JSON.stringify(err))
      mdb_uri = `Failed to fetch Connection URI: ${err}`
    }
  }
  if (!mongoClient) {
    mongoClient = await MongoClient.connect(mdb_uri, { useUnifiedTopology: true });
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
    // For now, dump the event in a web server for debugging
    if (process.env.DEBUG) console.log("request(lh): ", JSON.stringify(event));

    // Get Music Collection && setup query for _id matching (if exists)
    const coll = await dbCollection('music');
    const match = event.pathParameters ? ({ _id: ObjectId(event.pathParameters._id)}) : {};

    // Convert the body to an Album, present
    // handle application/json | x-www-form-urlencoded
    // Content-Type may be camel case or lowercase
    let album;
    switch (event.body && (event.headers["Content-Type"] || event.headers["content-type"]).split(`;`)[0]) {
      case "application/json": {
        album = JSON.parse(event.body);
        break;
      }
      case "application/x-www-form-urlencoded": {
        let k,v;
        album = event.body.split("&").reduce((p,pair) => ([k,v] = pair.split("="), p[k]=v, p), ({}));
        break;
      }
    }

    // Which HTTP Method brought us here? Take appropriate action
    switch (event.httpMethod) {
      case "GET": {
        let records = await coll.aggregate([{ $match: match }, { $sort: { title: 1 }}]);
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify(await records.toArray())
        };
      }

      case "POST": {
        let ret = await coll.insertOne(album);

        if (ret.insertedCount == 1) {
          return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'POST album', album: ret.ops[0] })
          };
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

      case "OPTIONS": {
        return {
          statusCode: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS, GET, DELETE, PUT, PATCH, HEAD",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": 30,
          }
        }
      }

      default: {
        // Unknown http method
        throw `Unknown HTTP Verb(lh): ${event.httpMethod}`
      }
    }
  }
  catch (err) {
    process.env.NODE_ENV == "test" || console.warn(err);
    return {
      'statusCode': 403,
      'body': JSON.stringify({ err })
    };
  }
};


exports.triggerWebhook = async (event, context) => {
  try {
    if (process.env.DEBUG) console.log("request(tw): ", JSON.stringify(event));

    switch (event.httpMethod) {
      case "POST" : {
        try {
          const webhookUri = await getAwsParameter(TRIGGER);

          let res = await axios.post(webhookUri, {});
          if (process.env.DEBUG) console.log("Result:", res.status, res.data);
          return {
            statusCode: res.status,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify(res.data)
          };
        }
        catch (error) {
          process.env.NODE_ENV == "test" || console.warn(error);

          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("POST error.response:")
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            return { statusCode: error.response.status, body: JSON.stringify(error.response.data) };
          }
          if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("POST error.request:")
            console.log(error.request);
            return { statusCode: 500, body: JSON.stringify(error.request) };
          }

          // Something happened in setting up the request that triggered an Error
          console.log("POST error (generic):")
          console.log('Error', error.message);
          return { statusCode: 500, body: JSON.stringify(error.message) };

        }
      }
      case "OPTIONS": {
        return {
          statusCode: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": 30,
          }
        }
      }

      default: {
        // Unknown http method
        throw `Unknown HTTP Verb(tw): ${event.httpMethod}`
      }

    }
  }
  catch (err) {
    process.env.NODE_ENV == "test" || console.warn(err);
    return {
      'statusCode': 403,
      'body': JSON.stringify({ err })
    };
  }
}


exports.cleanUp = async () => {
  await mongoClient.close();
}

exports.connectUri = (uri) => {
  mdb_uri = uri;
}
