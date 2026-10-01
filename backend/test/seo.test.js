const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, signIn, makeJpeg, createWork, uploadPhoto } = require("./setup");

const setUpGavarnie = async () => {
  const auth = await signIn();
  const work = await createWork(auth);

  for (const title of ["Cirque", "Brèche"]) {
    await uploadPhoto(auth, work._id, { title, photoDate: "2020-08-20" }, await makeJpeg(1600, 1000))
      .expect(201);
  }

  return work;
};

const metaContent = (html, key) =>
  html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)">`))?.[1];

describe("sitemap", () => {
  it("lists the pages and every photo, in both languages, with x-default", async () => {
    await setUpGavarnie();

    const { text } = await request(app).get("/sitemap.xml").expect(200);

    for (const path of ["/works", "/about", "/contact", "/legal", "/works/gavarnie/1", "/works/gavarnie/2"]) {
      assert.match(text, new RegExp(`<loc>https://alexandremaurice.fr/fr${path}</loc>`));
      assert.match(text, new RegExp(`<loc>https://alexandremaurice.fr/en${path}</loc>`));
    }
    assert.match(
      text,
      /hreflang="x-default" href="https:\/\/alexandremaurice.fr\/en\/works\/gavarnie\/1"/
    );
    assert.doesNotMatch(text, /gavarnie\/3/);
  });

  it("is compressed for clients that accept it", async () => {
    await setUpGavarnie();

    const response = await request(app)
      .get("/sitemap.xml")
      .set("Accept-Encoding", "gzip")
      .expect(200);
    assert.equal(response.headers["content-encoding"], "gzip");
  });
});

describe("link previews", () => {
  it("describe the photo of a work page, with its size and alt text", async () => {
    await setUpGavarnie();

    const { text } = await request(app).get("/__preview/fr/works/gavarnie/2").expect(200);

    assert.match(text, /<html lang="fr">/);
    assert.equal(metaContent(text, "og:title"), "alexandre maurice | travaux - Gavarnie");
    assert.match(metaContent(text, "og:image"), /\/uploads\/sizes\/1280\/.+\.jpg$/);
    assert.equal(metaContent(text, "og:image:width"), "1280");
    assert.equal(metaContent(text, "og:image:height"), "800");
    assert.equal(metaContent(text, "og:image:alt"), "Brèche");
  });

  it("describe the fixed pages, and fall back to the works page for anything else", async () => {
    const about = await request(app).get("/__preview/en/about").expect(200);
    assert.equal(metaContent(about.text, "og:title"), "alexandre maurice | about");

    const legal = await request(app).get("/__preview/fr/legal").expect(200);
    assert.equal(metaContent(legal.text, "og:title"), "alexandre maurice | mentions légales");

    for (const path of ["/fr/locale", "/fr/constructor", "/fr/work", "/fr/__proto__"]) {
      const { text } = await request(app).get(`/__preview${path}`).expect(200);
      assert.equal(metaContent(text, "og:title"), "alexandre maurice | travaux", path);
    }
  });
});

describe("page existence check", () => {
  it("answers 204 for an existing work and 403 for anything else", async () => {
    await setUpGavarnie();

    await request(app).get("/__exists/fr/works/gavarnie").expect(204);
    await request(app).get("/__exists/en/works/gavarnie/2").expect(204);
    await request(app).get("/__exists/fr/works/unknown").expect(403);
    await request(app).get("/__exists/fr/about").expect(403);
  });
});
