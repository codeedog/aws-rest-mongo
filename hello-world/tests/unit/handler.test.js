'use strict';

const app = require('../../app.js');

//   const response = await axios.get("http://localhost:3000/hello", { params: query });
describe(
  'Test: Reads',
  () => {

    it("Fetch a bundle", async () => {
      const response = await app.lambdaHandler({httpMethod: "GET"}, {});
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify({message: [1,2,"buckle",{"my":"shoe"}]}));
    });

    it("Fetch one", async () => {
      const _id = "1234567890ABCDEF1234567890ABCDEF";
      const response = await app.lambdaHandler({httpMethod: "GET", pathParameters: {_id}}, {});

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify({message:`one fabulous item '${_id}'`}));
    });

  }
);

describe(
  'Test: Updates',
  () => {
    const _id = "xxx";

    it("Put in a change", async () => {
      const albumChange = { title: "Dancing Bears" };
      const response = await app.lambdaHandler({httpMethod: "PUT", pathParameters: {_id}, body: albumChange}, {});

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify({message: { put: albumChange}}));
    });

    it("Patch in a change", async () => {
      const albumChange = { title: "Dancing Pooh Bears" };
      const response = await app.lambdaHandler({httpMethod: "PATCH", pathParameters: {_id}, body: albumChange}, {});

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify({message: { patch: albumChange}}));
    });

  }
);


describe(
  'Test: Create & Delete',
  () => {
    let _id;

    it("Post an album", async () => {
      const album = { title: "Skeletons From the Closet", band: "The Grateful Dead" };
      const response = await app.lambdaHandler({httpMethod: "POST", pathParameters: {_id}, body: album}, {});

      //_id = reponse.data.message._id
      _id = "made-up-id";

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify({message: { create: album}}));
    });

    it("Delete the album", async () => {
      const response = await app.lambdaHandler({httpMethod: "DELETE", pathParameters: {_id}}, {});

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(JSON.stringify({message: {delete: "kill it"}}));
    });

  }
);

describe(
  'Test: Error Conditions',
  () => {

    it("Fetch a bundle", async () => {
      const response = await app.lambdaHandler({httpMethod: "HEAD"}, {});
      expect(response.statusCode).toEqual(403);
      expect(response.body).toEqual(JSON.stringify({err: "Unknown HTTP Verb: HEAD"}));
    });

  }
);


/*

it("Fetch one", async () => {
  const _id = "1234567890ABCDEF1234567890ABCDEF";
  const response = await axios.get(`http://localhost:3000/hello/${_id}`, {
    params: query
  });

  expect(response.status).to.be.equal(200);
  expect(response.data.message).to.be.eql([1,2,"buckle",{"my":"shoe"}]);
  //expect(response.data).toEqual(`Queries: ${JSON.stringify(query)}`);
});

    it('verifies successful response', async () => {
        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal("hello world");
        // expect(response.location).to.be.an("string");
    });
    */
