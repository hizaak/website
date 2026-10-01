const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, signIn, makeJpeg, listUploads } = require("./setup");
const Photo = require("../models/Photo");
const { migratePhotoDates } = require("../services/photo-dates");

const createWork = async (auth, title = "Gavarnie") =>
  (await request(app).post("/api/works").set("Authorization", auth).send({ title }).expect(201))
    .body;

const uploadPhoto = (auth, workId, fields, image) =>
  request(app)
    .post(`/api/works/${workId}/photos`)
    .set("Authorization", auth)
    .field(fields)
    .attach("photo", image, "photo.jpg");

describe("photos", () => {
  it("stores the original, its thumbnail and the sizes below its long edge", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    const response = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      await makeJpeg(1600, 1000)
    ).expect(201);

    const photo = response.body;
    assert.equal(photo.photoDate, "2023-08-14T00:00:00.000Z");
    assert.equal(photo.width, 1600);
    assert.equal(photo.height, 1000);
    assert.deepEqual(photo.sizes, [{ size: 1280, width: 1280, height: 800 }]);
    assert.deepEqual(listUploads(), [
      photo.filename,
      `sizes/1280/${photo.filename}`,
      `thumbnails/${photo.filename}`,
    ]);
  });

  it("leaves no file behind when the fields are invalid", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "31/02/2023" },
      await makeJpeg(400, 300)
    ).expect(400);

    assert.deepEqual(listUploads(), []);
  });

  it("removes every file of a photo when it is deleted", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const { body: photo } = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      await makeJpeg(1600, 1000)
    ).expect(201);

    await request(app).delete(`/api/photos/${photo._id}`).set("Authorization", auth).expect(200);

    assert.deepEqual(listUploads(), []);
  });

  it("removes the photos and all their files with their work", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    for (const title of ["Cirque", "Brèche"]) {
      await uploadPhoto(
        auth,
        work._id,
        { title, photoDate: "2023-08-14" },
        await makeJpeg(1600, 1000)
      ).expect(201);
    }

    await request(app).delete(`/api/works/${work._id}`).set("Authorization", auth).expect(200);

    assert.equal(await Photo.countDocuments(), 0);
    assert.deepEqual(listUploads(), []);
  });

  it("lists works with the years of their photos", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    await createWork(auth, "Empty");

    for (const photoDate of ["2019-05-01", "2023-08-14"]) {
      await uploadPhoto(
        auth,
        work._id,
        { title: photoDate, photoDate },
        await makeJpeg(200, 100)
      ).expect(201);
    }

    const { body } = await request(app).get("/api/pages/works").expect(200);
    assert.deepEqual(
      body.map(({ title, slug, yearRange }) => ({ title, slug, yearRange })),
      [
        { title: "Empty", slug: "empty", yearRange: "" },
        { title: "Gavarnie", slug: "gavarnie", yearRange: "2019-2023" },
      ]
    );
  });
});

describe("photo date migration", () => {
  it("converts DD/MM/YYYY strings to UTC dates", async () => {
    const legacy = {
      workId: new Photo()._id,
      title: "Old",
      filename: "old.jpg",
      originalFilename: "old.jpg",
      mimeType: "image/jpeg",
      position: 0,
    };
    await Photo.collection.insertMany([
      { ...legacy, photoDate: "12/03/2021" },
      { ...legacy, photoDate: "31/02/2021" },
    ]);

    await migratePhotoDates();

    const dates = (await Photo.collection.find().toArray()).map((photo) => photo.photoDate);
    assert.deepEqual(dates, [new Date("2021-03-12T00:00:00.000Z"), "31/02/2021"]);
  });
});
