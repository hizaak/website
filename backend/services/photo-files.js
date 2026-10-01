const fs = require("fs");
const path = require("path");
const Photo = require("../models/Photo");
const { UPLOAD_DIR, writeThumbnail } = require("../config/upload");

// One-off migration: generates the missing thumbnail for any photo that
// doesn't have one yet (e.g. photos created before thumbnails existed).
const backfillMissingThumbnails = async () => {
  // Matches documents where the field is null OR doesn't exist at all.
  const photosWithoutThumbnail = await Photo.find({ thumbnailFilename: null });

  if (!photosWithoutThumbnail.length) {
    console.log("Thumbnail backfill: nothing to do.");
    return;
  }

  console.log(
    `Thumbnail backfill: generating ${photosWithoutThumbnail.length} missing thumbnail(s)...`
  );

  for (const photo of photosWithoutThumbnail) {
    try {
      const originalPath = path.join(UPLOAD_DIR, photo.filename);

      if (!fs.existsSync(originalPath)) {
        console.warn(
          `Thumbnail backfill: skipping photo ${photo._id}, original file missing (${photo.filename}).`
        );
        continue;
      }

      const buffer = fs.readFileSync(originalPath);
      await writeThumbnail(buffer, photo.mimeType, photo.filename);

      photo.thumbnailFilename = photo.filename;
      await photo.save();
    } catch (error) {
      console.error(`Thumbnail backfill: error processing photo ${photo._id}:`, error);
    }
  }

  console.log("Thumbnail backfill complete.");
};

module.exports = { backfillMissingThumbnails };
