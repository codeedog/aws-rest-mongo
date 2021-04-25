// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;

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
      let message;
        // const ret = await axios(url);
        console.log("request:   ", JSON.stringify(event));

        switch (event.httpMethod) {
          case "GET": { // event.pathParameters._id will be all vs. one
            if (event.pathParameters && event.pathParameters._id) {
              message = `one fabulous item '${event.pathParameters._id}'`;
            } else {
              message = [ 1, 2, "buckle", { my: "shoe" }];
            }
          }
          break;

          case "POST": {
            message = { create: event.body };
          }
          break;

          case "PUT": case "PATCH": {
            message = {};
            message[event.httpMethod.toLowerCase()] = event.body;
          }
          break;

          case "DELETE": {
            message = { delete: "kill it" };
          }
          break;
        }

        /*console.log("httpMethod:", event.httpMethod);

        if (event.queryStringParameters && event.queryStringParameters.title) {
          console.log("q(title):  ", event.queryStringParameters.title);
        }

        if (event.headers && (event.headers["Content-Type"] || event.headers["content-type"])) {
          console.log("h(content-type):", event.headers["Content-Type"] || event.headers["content-type"]);
        }

        if (event.body) {
          console.log("b(data):   ", event.body);
        }*/

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
              message
                //message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
