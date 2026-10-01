const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, signIn, createWork } = require("./setup");
const Work = require("../models/Work");
const { backfillWorkSlugs } = require("../services/work-lookup");

describe("works", () => {
  it("are found by slug or by id", async () => {
    const auth = await signIn();
    const work = await createWork(auth, "Pays basque");

    assert.equal(work.slug, "pays-basque");
    await request(app).get("/api/pages/work/pays-basque").expect(200);
    await request(app).get(`/api/pages/work/${work._id}`).expect(200);
    await request(app).get("/api/pages/work/pays").expect(404);
  });

  it("refuse a title whose slug is already taken", async () => {
    const auth = await signIn();
    await createWork(auth, "Pays basque");

    await request(app)
      .post("/api/works")
      .set("Authorization", auth)
      .send({ title: "Pays Basque" })
      .expect(409);
  });

  it("follow their title when renamed", async () => {
    const auth = await signIn();
    const work = await createWork(auth, "Gavarnie");

    const { body } = await request(app)
      .put(`/api/works/${work._id}`)
      .set("Authorization", auth)
      .send({ title: "Cirque de Gavarnie" })
      .expect(200);

    assert.equal(body.slug, "cirque-de-gavarnie");
  });

  it("get a slug at startup when created without one", async () => {
    await Work.collection.insertOne({ title: "Brèche de Roland" });

    await backfillWorkSlugs();

    await request(app).get("/api/pages/work/breche-de-roland").expect(200);
  });
});
