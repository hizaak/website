const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, signIn, listUploads } = require("./setup");

const uploadDocument = (auth, content, originalName, fields = {}) =>
  request(app)
    .post("/api/documents")
    .set("Authorization", auth)
    .field(fields)
    .attach("document", Buffer.from(content), originalName);

describe("documents", () => {
  it("are managed by the admin only", async () => {
    await request(app).get("/api/documents").expect(401);
    await request(app)
      .post("/api/documents")
      .attach("document", Buffer.from("x"), "cv.pdf")
      .expect(401);
  });

  it("names the file after the uploaded one when no name is given", async () => {
    const auth = await signIn();

    const { body } = await uploadDocument(auth, "%PDF", "Mon CV Été.PDF").expect(201);

    assert.equal(body.filename, "mon-cv-ete.pdf");
    assert.equal(body.slug, "mon-cv-ete");
    assert.deepEqual(listUploads(), ["documents/mon-cv-ete.pdf"]);
  });

  it("rejects names that are not URL-safe or change the extension", async () => {
    const auth = await signIn();

    for (const [name, code] of [
      ["../../app", "DOCUMENT_NAME_INVALID"],
      ["Mon CV", "DOCUMENT_NAME_INVALID"],
      ["cv.html", "DOCUMENT_EXTENSION_MISMATCH"],
    ]) {
      const { body } = await uploadDocument(auth, "%PDF", "cv.pdf", { name }).expect(400);
      assert.equal(body.code, code, name);
    }

    assert.deepEqual(listUploads(), []);
  });

  it("replaces a document under the same address only when asked to", async () => {
    const auth = await signIn();
    await uploadDocument(auth, "%PDF", "cv.pdf").expect(201);

    const { body } = await uploadDocument(auth, "docx", "cv.docx").expect(409);
    assert.equal(body.code, "DOCUMENT_NAME_TAKEN");

    await uploadDocument(auth, "docx", "cv.docx", { replace: "true" }).expect(201);
    assert.deepEqual(listUploads(), ["documents/cv.docx"]);
  });

  it("renames and deletes documents", async () => {
    const auth = await signIn();
    await uploadDocument(auth, "%PDF", "cv.pdf").expect(201);

    await request(app)
      .put("/api/documents/cv.pdf")
      .set("Authorization", auth)
      .send({ name: "resume" })
      .expect(200);
    assert.deepEqual(listUploads(), ["documents/resume.pdf"]);

    await request(app).delete("/api/documents/resume.pdf").set("Authorization", auth).expect(200);
    assert.deepEqual(listUploads(), []);
  });

  it("serves a PDF by its address, indexed only for the CV", async () => {
    const auth = await signIn();
    await uploadDocument(auth, "%PDF", "cv.pdf").expect(201);
    await uploadDocument(auth, "%PDF", "notes.pdf").expect(201);

    const cv = await request(app).get("/documents/cv").expect(200);
    assert.equal(cv.headers["content-type"], "application/pdf");
    assert.equal(cv.headers["x-robots-tag"], undefined);
    assert.equal(cv.headers["content-security-policy"], undefined);

    const notes = await request(app).get("/documents/notes.pdf").expect(200);
    assert.equal(notes.headers["x-robots-tag"], "noindex");
  });

  it("sandboxes every other type, which could run scripts on the site", async () => {
    const auth = await signIn();
    await uploadDocument(auth, "<script>alert(1)</script>", "page.html").expect(201);

    const response = await request(app).get("/documents/page").expect(200);
    assert.equal(response.headers["content-security-policy"], "sandbox");
  });

  it("answers 404 for unknown or unsafe names", async () => {
    await request(app).get("/documents/missing").expect(404);
    await request(app).get("/documents/..%2F..%2Fapp.js").expect(404);
  });
});
