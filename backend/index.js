require("dotenv").config();

const mongoose = require("mongoose");
const { checkEnvironment } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const { initializeAdminAccount } = require("./services/admin-account");
const { migratePhotoDates } = require("./services/photo-dates");
const { backfillWorkSlugs } = require("./services/work-lookup");
const { normalizeAllPhotoOrders } = require("./services/photo-order");
const {
  convertLegacyPngPhotos,
  backfillMissingThumbnails,
  backfillPhotoSizes,
  removeOrphanThumbnails,
} = require("./services/photo-files");

const port = process.env.PORT || 3000;

const start = async () => {
  checkEnvironment();
  await connectDB();

  // Must finish before the first request reads a photo or a work.
  await migratePhotoDates();
  await backfillWorkSlugs();
  await normalizeAllPhotoOrders();
  await initializeAdminAccount();

  const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });

  // Image work runs once the API is up: until it is done, photos are served
  // as they were.
  convertLegacyPngPhotos()
    .then(backfillMissingThumbnails)
    .then(backfillPhotoSizes)
    .then(removeOrphanThumbnails)
    .catch((error) => console.error("Photo file maintenance failed:", error));

  // docker stop sends SIGTERM: finish the requests in progress first.
  const shutdown = () => {
    server.close(() => mongoose.disconnect().then(() => process.exit(0)));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

start().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
