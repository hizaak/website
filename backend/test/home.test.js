const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, signIn, makeJpeg, createWork, uploadPhoto } = require("./setup");

describe("home page", () => {
  it("is null while the site has no photo", async () => {
    const { body } = await request(app).get("/api/pages/home").expect(200);
    assert.equal(body, null);
  });

  it("shows one of the photos, never cached", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    for (const title of ["Cirque", "Brèche"]) {
      await uploadPhoto(auth, work._id, { title, photoDate: "2020-08-20" }, await makeJpeg(1600, 1000))
        .expect(201);
    }

    const response = await request(app).get("/api/pages/home").expect(200);

    assert.equal(response.headers["cache-control"], "no-store");
    assert.ok(["Cirque", "Brèche"].includes(response.body.title));
    assert.equal(response.body.photoDate, "2020-08-20T00:00:00.000Z");
    assert.equal(response.body.width, 1600);
    assert.ok(response.body.filename);
  });

  it("leaves out the photo already shown, unless it is the only one", async () => {
    const auth = await signIn();
    const work = await createWork(auth);

    const { body: only } = await uploadPhoto(auth, work._id, { title: "Cirque", photoDate: "2020-08-20" }, await makeJpeg(800, 500))
      .expect(201);

    const alone = await request(app).get(`/api/pages/home?not=${only._id}`).expect(200);
    assert.equal(alone.body._id, only._id);

    await uploadPhoto(auth, work._id, { title: "Brèche", photoDate: "2020-08-20" }, await makeJpeg(800, 500))
      .expect(201);

    for (let i = 0; i < 5; i++) {
      const { body } = await request(app).get(`/api/pages/home?not=${only._id}`).expect(200);
      assert.equal(body.title, "Brèche");
    }

    await request(app).get("/api/pages/home?not=garbage").expect(200);
  });
});
