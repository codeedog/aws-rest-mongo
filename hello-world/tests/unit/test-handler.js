'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
const axios = require('axios');
var event, context;

const TEST_URI = process.env.TEST_URI || "http://localhost:3000/hello";

describe(
  'Test: Reads',
  () => {

    it("Fetch a bundle", async () => {
      //const query = { a: "hi" };
      const response = await axios.get(TEST_URI);

      expect(response.status).to.be.equal(200);
      expect(response.data.message).to.be.eql([1,2,"buckle",{"my":"shoe"}]);
      //expect(response.data).toEqual(`Queries: ${JSON.stringify(query)}`);
    });

    it("Fetch one", async () => {
      const _id = "1234567890ABCDEF1234567890ABCDEF";
      const response = await axios.get(`${TEST_URI}/${_id}`);

      expect(response.status).to.be.equal(200);
      expect(response.data.message).to.be.eql(`one fabulous item '${_id}'`);
    });

  }
);

describe(
  'Test: Updates',
  () => {

    it("Put in a change", async () => {
      const albumChange = { title: "Dancing Bears" };
      const _id = "xxx";
      const response = await axios.put(`${TEST_URI}/${_id}`, albumChange);

      expect(response.status).to.be.equal(200);
      expect(response.data.message).to.be.eql({ put: JSON.stringify(albumChange)});
    });

    it("Patch in a change", async () => {
      const albumChange = { title: "Dancing Pooh Bears" };
      const _id = "xxx";
      const response = await axios.patch(`${TEST_URI}/${_id}`, albumChange);

      expect(response.status).to.be.equal(200);
      expect(response.data.message).to.be.eql({ patch: JSON.stringify(albumChange)});
    });

  }
);

describe(
  'Test: Create & Delete',
  () => {
    let _id;

    it("Post an album", async () => {
      const album = { title: "Skeletons From the Closet", band: "The Grateful Dead" };
      const response = await axios.post(TEST_URI, album);

      //_id = reponse.data.message._id
      _id = "made-up-id";

      expect(response.status).to.be.equal(200);
      expect(response.data.message).to.be.eql({ create: JSON.stringify(album)});
    });

    it("Delete the album", async () => {
      const response = await axios.delete(`${TEST_URI}/${_id}`);

      expect(response.status).to.be.equal(200);
      expect(response.data.message).to.be.eql({delete: "kill it"});
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
