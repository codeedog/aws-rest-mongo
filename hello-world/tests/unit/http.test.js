'use strict';

const app = require('../../app.js');
const axios = require('axios');
const { MongoClient, ObjectId, Collection } = require('mongodb');

const TEST_URI = "hello";




//   const response = await axios.get("http://localhost:3000/hello", { params: query });
describe(
  'Test: Reads',
  () => {

    it("Fetch a bundle", async () => {
      const response = await axios.get(TEST_URI);

      expect(response.status).toEqual(200);
      expect(response.data.message).toEqual([1,2,"buckle",{"my":"shoe"}]);
    });

    it("Fetch one", async () => {
      const _id = "1234567890ABCDEF1234567890ABCDEF";
      const response = await axios.get(`${TEST_URI}/${_id}`);

      expect(response.status).toEqual(200);
      expect(response.data.message).toEqual(`one fabulous item '${_id}'`);
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

      expect(response.status).toEqual(200);
      expect(response.data.message).toEqual({ put: JSON.stringify(albumChange)});
    });

    it("Patch in a change", async () => {
      const albumChange = { title: "Dancing Pooh Bears" };
      const _id = "xxx";
      const response = await axios.patch(`${TEST_URI}/${_id}`, albumChange);

      expect(response.status).toEqual(200);
      expect(response.data.message).toEqual({ patch: JSON.stringify(albumChange)});
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

      expect(response.status).toEqual(200);
      expect(response.data.message).toEqual({ create: JSON.stringify(album)});
    });

    it("Delete the album", async () => {
      const response = await axios.delete(`${TEST_URI}/${_id}`);

      expect(response.status).toEqual(200);
      expect(response.data.message).toEqual({delete: "kill it"});
    });

  }
);
