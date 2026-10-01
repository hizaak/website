// Shared by every test file: an in-memory MongoDB, a temporary upload folder
// and a signed-in admin. Must be required before anything from the app.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { after, before, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const sharp = require("sharp");

process.env.JWT_SECRET = "test-secret";
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "site-perso-uploads-"));

const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

const UPLOAD_DIR = process.env.UPLOAD_DIR;
let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();

  // Keeps the folders upload.js created, empties them.
  for (const file of listUploads()) {
    fs.unlinkSync(path.join(UPLOAD_DIR, file));
  }
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
  fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
});

const ADMIN = { username: "admin", password: "correct-horse-battery" };

// Creates the admin account and returns a valid Authorization header.
const signIn = async () => {
  await new User(ADMIN).save();
  const response = await request(app).post("/login").send(ADMIN).expect(200);
  return `Bearer ${response.body.token}`;
};

// A real JPEG, so that uploads go through the whole sharp pipeline.
const makeJpeg = (width, height) =>
  sharp({
    create: { width, height, channels: 3, background: { r: 90, g: 120, b: 160 } },
  })
    .jpeg()
    .toBuffer();

// Every file currently stored under the upload folder, relative to it.
const listUploads = () =>
  fs
    .readdirSync(UPLOAD_DIR, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(UPLOAD_DIR, path.join(entry.parentPath, entry.name)).split(path.sep).join("/")
    )
    .sort();

module.exports = { app, request, ADMIN, signIn, makeJpeg, listUploads, UPLOAD_DIR };
