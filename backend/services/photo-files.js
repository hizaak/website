const fs = require("fs");
const path = require("path");
const Photo = require("../models/Photo");
const {
  UPLOAD_DIR,
  THUMBNAIL_DIR,
  ORIGINALS_DIR,
  PHOTO_SIZES,
  PUBLISHED_MIME,
  deletePhotoFiles,
  publishImage,
  writeThumbnail,
  writeSizes,
} = require("../config/upload");

// One-off migration: photos used to be published in their upload format, and
// PNGs were quantized to 256 colours to fit the size budget. Each one is
// republished as a JPEG; its PNG becomes the photo's original (it is the best
// copy the server has), so nothing is lost.
const convertLegacyPngPhotos = async () => {
  const legacy = await Photo.find({ mimeType: { $ne: PUBLISHED_MIME } });

  if (!legacy.length) {
    return;
  }

  console.log(`PNG conversion: republishing ${legacy.length} photo(s) as JPEG...`);

  for (const photo of legacy) {
    try {
      const publishedPath = path.join(UPLOAD_DIR, photo.filename);

      if (!fs.existsSync(publishedPath)) {
        console.warn(`PNG conversion: skipping photo ${photo._id}, file missing (${photo.filename}).`);
        continue;
      }

      const previous = {
        filename: photo.filename,
        thumbnailFilename: photo.thumbnailFilename,
      };

      // Copied first: the record keeps pointing to working files until saved.
      if (!photo.originalFile) {
        fs.copyFileSync(publishedPath, path.join(ORIGINALS_DIR, photo.filename));
        photo.originalFile = photo.filename;
      }

      photo.set(await publishImage(fs.readFileSync(publishedPath)));
      await photo.save();

      deletePhotoFiles(previous);
    } catch (error) {
      console.error(`PNG conversion: error processing photo ${photo._id}:`, error);
    }
  }

  console.log("PNG conversion complete.");
};

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
      const publishedPath = path.join(UPLOAD_DIR, photo.filename);

      if (!fs.existsSync(publishedPath)) {
        console.warn(
          `Thumbnail backfill: skipping photo ${photo._id}, file missing (${photo.filename}).`
        );
        continue;
      }

      await writeThumbnail(fs.readFileSync(publishedPath), photo.filename);

      photo.thumbnailFilename = photo.filename;
      await photo.save();
    } catch (error) {
      console.error(`Thumbnail backfill: error processing photo ${photo._id}:`, error);
    }
  }

  console.log("Thumbnail backfill complete.");
};

// One-off migration: records the dimensions of photos uploaded before they
// were stored, and writes their intermediate sizes (or the ones added to
// PHOTO_SIZES since).
const needsSizes = (photo) =>
  !photo.width ||
  !photo.sizes ||
  PHOTO_SIZES.some(
    (size) =>
      size < Math.max(photo.width, photo.height) &&
      !photo.sizes.some((existing) => existing.size === size)
  );

const backfillPhotoSizes = async () => {
  const incomplete = (await Photo.find()).filter(needsSizes);

  if (!incomplete.length) {
    console.log("Size backfill: nothing to do.");
    return;
  }

  console.log(`Size backfill: processing ${incomplete.length} photo(s)...`);

  for (const photo of incomplete) {
    try {
      const publishedPath = path.join(UPLOAD_DIR, photo.filename);

      if (!fs.existsSync(publishedPath)) {
        console.warn(`Size backfill: skipping photo ${photo._id}, file missing.`);
        continue;
      }

      photo.set(await writeSizes(fs.readFileSync(publishedPath), photo.filename));
      await photo.save();
    } catch (error) {
      console.error(`Size backfill: error processing photo ${photo._id}:`, error);
    }
  }

  console.log("Size backfill complete.");
};

// Removes thumbnails no photo points to anymore (deleting a work used to
// leave its thumbnails behind). Only thumbnails: they can always be
// regenerated, so a mistake here never loses an original.
const removeOrphanThumbnails = async () => {
  const photos = await Photo.find({}, { thumbnailFilename: 1 }).lean();
  const used = new Set(photos.map((photo) => photo.thumbnailFilename).filter(Boolean));

  const orphans = fs
    .readdirSync(THUMBNAIL_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.name.startsWith(".") && !used.has(entry.name));

  for (const entry of orphans) {
    fs.unlinkSync(path.join(THUMBNAIL_DIR, entry.name));
  }

  if (orphans.length) {
    console.log(`Removed ${orphans.length} orphan thumbnail(s).`);
  }
};

module.exports = {
  convertLegacyPngPhotos,
  backfillMissingThumbnails,
  backfillPhotoSizes,
  removeOrphanThumbnails,
};
