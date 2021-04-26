'use strict';

const axios = require('axios');

const TEST_URI = "hello";


//   const response = await axios.get("http://localhost:3000/hello", { params: query });
describe(
  'Test: Reads',
  () => {

    it("Fetch a bundle", async () => {
      const response = await axios.get(TEST_URI);

      expect(response.status).toEqual(200);
      expect(response.data).toEqual([
        { _id: '607f0191b849a1b374ab9598', title: 'Aoxomoxoa',         band: 'The Grateful Dead' },
        { _id: '607f020fa563892026926b46', title: 'Wake of the Flood', band: 'The Grateful Dead' },
        { _id: '607f0191b849a1b374ab9597', title: "Workingman's Dead", band: 'The Grateful Dead' }
      ]);
    });

    it("Fetch one", async () => {
      const _id = "607f0191b849a1b374ab9598";
      const response = await axios.get(`${TEST_URI}/${_id}`);

      expect(response.status).toEqual(200);
      expect(response.data).toEqual([{ _id: '607f0191b849a1b374ab9598', title: 'Aoxomoxoa', band: 'The Grateful Dead' }]);
    });

  }
);

describe(
  'Test: Updates',
  () => {

    it("Put in a change", async () => {
      const albumChange = { title: "Dancing Bears" };
      const _id = "607f0191b849a1b374ab9598";
      const response = await axios.put(`${TEST_URI}/${_id}`, albumChange);

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({ message: "PUT album change", album: { _id: '607f0191b849a1b374ab9598', title: 'Dancing Bears', band: 'The Grateful Dead' }});
    });

    it("Patch in a change", async () => {
      const albumChange = { title: "Aoxomoxoa" };
      const _id = "607f0191b849a1b374ab9598";
      const response = await axios.patch(`${TEST_URI}/${_id}`, albumChange);

      expect(response.status).toEqual(200);
      expect(response.data).toEqual({ message: "PATCH album change", album: { _id: '607f0191b849a1b374ab9598', title: 'Aoxomoxoa', band: 'The Grateful Dead' }});
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
