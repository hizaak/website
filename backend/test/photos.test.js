const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const {
  app,
  request,
  signIn,
  makeJpeg,
  makePng,
  createWork,
  uploadPhoto,
  listUploads,
  UPLOAD_DIR,
} = require("./setup");
const Photo = require("../models/Photo");
const { migratePhotoDates } = require("../services/photo-dates");
const { convertLegacyPngPhotos } = require("../services/photo-files");

const readUpload = (relativePath) => fs.readFileSync(path.join(UPLOAD_DIR, relativePath));

describe("photos", () => {
  it("publishes a JPEG, its thumbnail and the sizes below its long edge, and keeps the original", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const image = await makeJpeg(1600, 1000);

    const response = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      image
    ).expect(201);

    const photo = response.body;
    assert.equal(photo.photoDate, "2023-08-14T00:00:00.000Z");
    assert.equal(photo.width, 1600);
    assert.equal(photo.height, 1000);
    assert.deepEqual(photo.sizes, [{ size: 1280, width: 1280, height: 800 }]);
    assert.match(photo.filename, /\.jpg$/);
    assert.deepEqual(listUploads(), [
      photo.filename,
      `originals/${photo.originalFile}`,
      `sizes/1280/${photo.filename}`,
      `thumbnails/${photo.filename}`,
    ]);
    assert.deepEqual(readUpload(`originals/${photo.originalFile}`), image);
  });

  it("publishes a PNG as a full-colour JPEG, and keeps the PNG as the original", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    const { body: photo } = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      await makePng(1600, 1000),
      "cirque.png"
    ).expect(201);

    assert.equal(photo.mimeType, "image/jpeg");
    assert.match(photo.filename, /\.jpg$/);
    assert.match(photo.originalFile, /\.png$/);

    for (const file of [photo.filename, `sizes/1280/${photo.filename}`]) {
      const metadata = await sharp(readUpload(file)).metadata();
      assert.equal(metadata.format, "jpeg");
      assert.equal(metadata.channels, 3);
    }
  });

  it("writes the author and copyright into published images, and nothing else", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    const { body: photo } = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      await makeJpeg(1600, 1000)
    ).expect(201);

    for (const file of [photo.filename, `sizes/1280/${photo.filename}`]) {
      const { exif } = await sharp(readUpload(file)).metadata();
      const text = exif.toString("latin1");
      assert.match(text, /Alexandre Maurice/);
      assert.match(text, /alexandremaurice\.fr/);
      assert.doesNotMatch(text, /GPS/);
    }
  });

  it("serves the original to the admin only, under its uploaded name", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const image = await makeJpeg(400, 300);

    const { body: photo } = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      image,
      "Échelle des Sarradets.jpg"
    ).expect(201);

    await request(app).get(`/api/photos/${photo._id}/original`).expect(401);

    const response = await request(app)
      .get(`/api/photos/${photo._id}/original`)
      .set("Authorization", auth)
      .buffer(true)
      .parse((res, done) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);

    assert.deepEqual(response.body, image);
    assert.match(response.headers["content-disposition"], /attachment/);
    assert.match(
      decodeURIComponent(response.headers["content-disposition"]),
      /Échelle des Sarradets\.jpg/
    );
  });

  it("never serves originals from the public uploads route", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    const { body: photo } = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      await makeJpeg(400, 300)
    ).expect(201);

    await request(app).get(`/uploads/${photo.filename}`).expect(200);

    for (const url of [
      `/uploads/originals/${photo.originalFile}`,
      `/uploads//originals/${photo.originalFile}`,
      `/uploads/./originals/${photo.originalFile}`,
      `/uploads/%6Friginals/${photo.originalFile}`,
      `/uploads/ORIGINALS/${photo.originalFile}`,
      `/uploads/sizes/../originals/${photo.originalFile}`,
    ]) {
      const response = await request(app).get(url);
      assert.notEqual(response.status, 200, url);
    }
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

  it("replaces every file of a photo when its image is replaced", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const { body: photo } = await uploadPhoto(
      auth,
      work._id,
      { title: "Cirque", photoDate: "2023-08-14" },
      await makeJpeg(400, 300)
    ).expect(201);

    const { body: replaced } = await request(app)
      .put(`/api/photos/${photo._id}`)
      .set("Authorization", auth)
      .attach("photo", await makeJpeg(500, 300), "other.jpg")
      .expect(200);

    assert.equal(replaced.originalFilename, "other.jpg");
    assert.deepEqual(listUploads(), [
      replaced.filename,
      `originals/${replaced.originalFile}`,
      `thumbnails/${replaced.filename}`,
    ]);
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

describe("photo order", () => {
  const uploadThree = async (auth, workId) => {
    const photos = [];
    for (const title of ["A", "B", "C"]) {
      const { body } = await uploadPhoto(
        auth,
        workId,
        { title, photoDate: "2023-08-14" },
        await makeJpeg(200, 100)
      ).expect(201);
      photos.push(body);
    }
    return photos;
  };

  const titlesOf = async (workId) =>
    (await request(app).get(`/api/works/${workId}/photos`).expect(200)).body.map(
      ({ title, position }) => `${title}${position}`
    );

  it("appends new photos and keeps positions contiguous after a deletion", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const [, b] = await uploadThree(auth, work._id);

    assert.deepEqual(await titlesOf(work._id), ["A0", "B1", "C2"]);

    await request(app).delete(`/api/photos/${b._id}`).set("Authorization", auth).expect(200);
    assert.deepEqual(await titlesOf(work._id), ["A0", "C1"]);
  });

  it("reorders the photos, but only given all of them", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const [a, b, c] = await uploadThree(auth, work._id);

    await request(app)
      .put(`/api/works/${work._id}/photos/reorder`)
      .set("Authorization", auth)
      .send({ photoIds: [c._id, a._id] })
      .expect(400);

    await request(app)
      .put(`/api/works/${work._id}/photos/reorder`)
      .set("Authorization", auth)
      .send({ photoIds: [c._id, a._id, b._id] })
      .expect(200);

    assert.deepEqual(await titlesOf(work._id), ["C0", "A1", "B2"]);
  });
});

describe("legacy PNG conversion", () => {
  it("republishes a PNG photo as JPEG and keeps the PNG as its original", async () => {
    const auth = await signIn();
    const work = await createWork(auth);
    const png = await makePng(1600, 1000);

    fs.writeFileSync(path.join(UPLOAD_DIR, "legacy.png"), png);
    fs.writeFileSync(path.join(UPLOAD_DIR, "thumbnails", "legacy.png"), png);
    fs.writeFileSync(path.join(UPLOAD_DIR, "sizes", "1280", "legacy.png"), png);

    const { _id } = await new Photo({
      workId: work._id,
      title: "Old",
      photoDate: new Date("2020-08-20"),
      filename: "legacy.png",
      thumbnailFilename: "legacy.png",
      originalFilename: "legacy.png",
      mimeType: "image/png",
      width: 1600,
      height: 1000,
      sizes: [{ size: 1280, width: 1280, height: 800 }],
    }).save();

    await convertLegacyPngPhotos();

    const photo = await Photo.findById(_id);
    assert.equal(photo.mimeType, "image/jpeg");
    assert.equal(photo.originalFile, "legacy.png");
    assert.deepEqual(listUploads(), [
      photo.filename,
      "originals/legacy.png",
      `sizes/1280/${photo.filename}`,
      `thumbnails/${photo.filename}`,
    ]);
    assert.deepEqual(readUpload("originals/legacy.png"), png);
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
