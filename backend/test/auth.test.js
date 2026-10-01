const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { app, request, ADMIN, signIn } = require("./setup");

describe("auth", () => {
  it("rejects a wrong password with 401", async () => {
    await signIn();
    await request(app)
      .post("/login")
      .send({ username: ADMIN.username, password: "wrong-password" })
      .expect(401);
  });

  it("protects admin routes", async () => {
    await request(app).post("/api/works").send({ title: "Gavarnie" }).expect(401);
    await request(app)
      .post("/api/works")
      .set("Authorization", "Bearer not-a-token")
      .send({ title: "Gavarnie" })
      .expect(401);
  });

  it("changes the password only with the current one", async () => {
    const auth = await signIn();

    await request(app)
      .put("/account")
      .set("Authorization", auth)
      .send({ currentPassword: "wrong-password", newPassword: "another-long-password" })
      .expect(403);

    await request(app)
      .put("/account")
      .set("Authorization", auth)
      .send({ currentPassword: ADMIN.password, newPassword: "another-long-password" })
      .expect(200);

    await request(app)
      .post("/login")
      .send({ username: ADMIN.username, password: "another-long-password" })
      .expect(200);
  });
});

describe("errors", () => {
  it("answers malformed JSON with 400, not a server error", async () => {
    const response = await request(app)
      .post("/login")
      .set("Content-Type", "application/json")
      .send("{bad")
      .expect(400);

    assert.equal(response.body.message, "Invalid JSON body.");
  });

  it("answers a malformed id with 400", async () => {
    await request(app).get("/api/photos/not-an-id").expect(400);
  });

  it("reports the database state on /health", async () => {
    const response = await request(app).get("/health").expect(200);
    assert.equal(response.body.status, "ok");
  });

  it("sends security headers", async () => {
    const response = await request(app).get("/").expect(200);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["x-powered-by"], undefined);
  });
});
