'use strict';

const { lambdaHandler, cleanUp, connectUri } = require('../../app.js');
const resetters = require('./test-reset');

beforeAll(async () => {
  // Get the mongo URI from the local environment, we are not in AWS process
  require('dotenv').config({ path: `${process.env.PWD}/../.env`});
  connectUri(process.env.MONGODB_RW_URI);
})

afterAll(async () => {
  resetters.done();
  cleanUp();
})


describe(
  'Test: mongoDB Reset',
  () => {

    it("Wipe Music Collection", async () => {
      const response = await resetters.wipe.func(process.env.MONGODB_RW_URI);
      expect(response).toEqual(resetters.wipe.result);
    });

    it("Fill Music Collection", async () => {
      const response = await resetters.fill.func();
      expect(response).toEqual(resetters.fill.result);
    });

  }
)

//   const response = await axios.get("http://localhost:3000/hello", { params: query });
describe(
  'Test: Reads',
  () => {

    it("Fetch a bundle", async () => {
      const response = await lambdaHandler({httpMethod: "GET"}, {});
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual([
        { _id: '607f0191b849a1b374ab9598', title: 'Aoxomoxoa',         band: 'The Grateful Dead' },
        { _id: '607f020fa563892026926b46', title: 'Wake of the Flood', band: 'The Grateful Dead' },
        { _id: '607f0191b849a1b374ab9597', title: "Workingman's Dead", band: 'The Grateful Dead' }
      ]);
    });

    it("Fetch one", async () => {
      const _id = "607f0191b849a1b374ab9598";
      const response = await lambdaHandler({httpMethod: "GET", pathParameters: {_id}}, {});

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual([{ _id: '607f0191b849a1b374ab9598', title: 'Aoxomoxoa', band: 'The Grateful Dead' }]);
    });

  }
);

describe(
  'Test: Updates',
  () => {
    const _id = "607f0191b849a1b374ab9598";

    it("Put in a change", async () => {
      const albumChange = { title: "Dancing Bears" };
      const response = await lambdaHandler({httpMethod: "PUT", pathParameters: {_id}, headers: { "content-type": "application/json" }, body: JSON.stringify(albumChange)}, {});

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual({
        message: 'PUT album change',
        album: { _id: '607f0191b849a1b374ab9598', title: 'Dancing Bears', band: 'The Grateful Dead' }
      });
    });

    it("Patch in a change", async () => {
      const albumChange = { title: "Aoxomoxoa" };
      const response = await lambdaHandler({httpMethod: "PATCH", pathParameters: {_id}, headers: { "content-type": "application/json" }, body: JSON.stringify(albumChange)}, {});

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual({
        message: 'PATCH album change',
        album: { _id: '607f0191b849a1b374ab9598', title: 'Aoxomoxoa', band: 'The Grateful Dead' }
      });
    });

  }
);


describe(
  'Test: Create & Delete',
  () => {
    let _id;

    it("Post an album", async () => {
      const album = { title: "Skeletons From the Closet", band: "The Grateful Dead" };
      const response = await lambdaHandler({httpMethod: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(album)}, {});
      const body = JSON.parse(response.body);

      expect(response.statusCode).toEqual(200);
      expect(body.album.title).toEqual(album.title);
      expect(body.album.band).toEqual(album.band);
      _id = body.album._id;
    });

    it("Delete the album", async () => {
      const response = await lambdaHandler({httpMethod: "DELETE", pathParameters: {_id}}, {});

      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toEqual({ message: 'DELETE album', album: { _id: _id }});
    });

  }
);

describe(
  'Test: Error Conditions',
  () => {

    it("Fetch a bundle", async () => {
      const response = await lambdaHandler({httpMethod: "HEAD"}, {});
      expect(response.statusCode).toEqual(403);
      expect(response.body).toEqual(JSON.stringify({err: "Unknown HTTP Verb: HEAD"}));
    });

  }
);
