const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

// Overridable so that the tests write to a temporary folder.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, "thumbnails");
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, "documents");
const SIZES_DIR = path.join(UPLOAD_DIR, "sizes");
// Uploaded files exactly as received, downloadable from the admin only:
// app.js keeps this folder out of the public /uploads route.
const ORIGINALS_DIR = path.join(UPLOAD_DIR, "originals");

// Intermediate versions served through srcset, so that a phone doesn't
// download the full-size image. Each is a long-edge box: a photo smaller
// than the box doesn't get that version.
const PHOTO_SIZES = [1280, 2048];
const SIZE_JPEG_QUALITY = 86;

const sizeDir = (size) => path.join(SIZES_DIR, String(size));

for (const dir of [
  UPLOAD_DIR,
  THUMBNAIL_DIR,
  DOCUMENTS_DIR,
  ORIGINALS_DIR,
  ...PHOTO_SIZES.map(sizeDir),
]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const ALLOWED_MIMES = ["image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

// Every published image is a JPEG, whatever was uploaded: a PNG photo has no
// use for transparency, and PNG compression would either weigh several times
// more or, quantized to fit, reduce the photo to 256 colours.
const PUBLISHED_MIME = "image/jpeg";
const PUBLISHED_EXTENSION = ".jpg";

// Written into every published image. EXIF text is ASCII.
const AUTHOR = "Alexandre Maurice";
const COPYRIGHT = "Alexandre Maurice - alexandremaurice.fr";
const EXIF = { IFD0: { Artist: AUTHOR, Copyright: COPYRIGHT } };

// Long-edge ladder, largest first. At each step we retry at decreasing
// encode quality until the file fits MAX_OUTPUT_BYTES, only dropping to a
// smaller dimension if even the lowest quality at the current size doesn't.
// Keeps quality as high as possible for a given hard size budget, which
// matters for detail-critical landscape work on a small VPS (2 vCore/2GB).
const DIMENSION_STEPS = [3840, 3200, 2600, 2000];
const JPEG_QUALITY_STEPS = [92, 84, 76, 66, 50];
const MAX_OUTPUT_BYTES = 3 * 1024 * 1024;

// Small preview used by the admin photo lists, so the browser doesn't have
// to decode dozens of full-resolution images at once.
const THUMBNAIL_MAX_DIMENSION = 300;
const THUMBNAIL_JPEG_QUALITY = 80;

// Full-resolution exports of large sensors easily exceed 20 MB.
const MAX_IMAGE_BYTES = 50 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
    const error = new Error("Unsupported format. Only PNG and JPEG are accepted.");
    error.code = "IMAGE_FORMAT_UNSUPPORTED";
    return cb(error);
  }

  cb(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_IMAGE_BYTES },
});

const jpeg = (pipeline, quality) =>
  pipeline.jpeg({ quality, mozjpeg: true }).withExif(EXIF);

// Bakes in EXIF orientation, strips all metadata (GPS included) except the
// author and copyright, normalizes to sRGB on a white background (for PNGs
// with transparency), then walks the dimension/quality ladder until the
// encode fits MAX_OUTPUT_BYTES. Returns the smallest attempt found if the
// budget can't be hit even at the floor settings (near-impossible for real
// photos).
const encodeWithinBudget = async (buffer) => {
  let smallest = null;

  for (const dimension of DIMENSION_STEPS) {
    const base = sharp(buffer)
      .rotate()
      .resize(dimension, dimension, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .toColorspace("srgb");

    for (const quality of JPEG_QUALITY_STEPS) {
      const output = await jpeg(base.clone(), quality).toBuffer();

      if (!smallest || output.length < smallest.length) {
        smallest = output;
      }

      if (output.length <= MAX_OUTPUT_BYTES) {
        return output;
      }
    }
  }

  return smallest;
};

// Downscales an already-processed (oriented, sRGB) image buffer to a small
// preview. Takes the processed buffer rather than the raw upload so it never
// has to redo the EXIF/colorspace work.
const writeThumbnail = async (buffer, filename) => {
  const thumbnail = await sharp(buffer)
    .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: THUMBNAIL_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(path.join(THUMBNAIL_DIR, filename), thumbnail);
};

// Writes every intermediate size smaller than the processed image, and
// returns its dimensions along with the sizes written.
const writeSizes = async (buffer, filename) => {
  const { width, height } = await sharp(buffer).metadata();
  const sizes = [];

  for (const size of PHOTO_SIZES.filter((size) => size < Math.max(width, height))) {
    const { data, info } = await jpeg(
      sharp(buffer).resize(size, size, { fit: "inside" }).flatten({ background: "#ffffff" }),
      SIZE_JPEG_QUALITY
    ).toBuffer({ resolveWithObject: true });

    fs.writeFileSync(path.join(sizeDir(size), filename), data);
    sizes.push({ size, width: info.width, height: info.height });
  }

  return { width, height, sizes };
};

// Publishes an image: the full-size JPEG, its thumbnail and its sizes, all
// under a new name. Returns the fields of the photo record they fill in.
const publishImage = async (source) => {
  const filename = `${randomUUID()}${PUBLISHED_EXTENSION}`;

  try {
    const buffer = await encodeWithinBudget(source);

    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    await writeThumbnail(buffer, filename);
    const dimensions = await writeSizes(buffer, filename);

    return { filename, thumbnailFilename: filename, mimeType: PUBLISHED_MIME, ...dimensions };
  } catch (error) {
    deletePhotoFiles({ filename, thumbnailFilename: filename });
    throw error;
  }
};

// Runs after multer has buffered the file in memory and after the other
// fields have been validated, so that an invalid request never leaves files
// behind nor costs an encode. Sets req.file.photo to the fields of the photo
// record.
const processUploadedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalFile = `${randomUUID()}${path.extname(req.file.originalname).toLowerCase()}`;

  try {
    const published = await publishImage(req.file.buffer);
    fs.writeFileSync(path.join(ORIGINALS_DIR, originalFile), req.file.buffer);

    req.file.photo = {
      ...published,
      originalFile,
      originalFilename: req.file.originalname,
    };

    next();
  } catch (error) {
    console.error("Error processing uploaded image:", error);
    removeIfExists(path.join(ORIGINALS_DIR, originalFile));
    res.status(400).json({ message: "Unable to process image.", code: "IMAGE_UNREADABLE" });
  }
};

const uploadSingleImage = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large.", code: "IMAGE_TOO_LARGE" });
    }

    if (err) {
      return res.status(400).json({ message: err.message, code: err.code });
    }

    // Multer decodes multipart filenames as latin1; browsers send UTF-8.
    if (req.file) {
      req.file.originalname = Buffer.from(req.file.originalname, "latin1").toString("utf8");
    }

    next();
  });
};

// Raw documents are stored as-is (no processing), so they only stay in
// memory until the controller has picked their final name and written them.
const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES },
});

const uploadSingleDocument = (fieldName) => (req, res, next) => {
  documentUpload.single(fieldName)(req, res, (err) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large.", code: "DOCUMENT_TOO_LARGE" });
    }

    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Multer decodes multipart filenames as latin1; browsers send UTF-8.
    if (req.file) {
      req.file.originalname = Buffer.from(req.file.originalname, "latin1").toString("utf8");
    }

    next();
  });
};

const removeIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const originalPath = (originalFile) => path.join(ORIGINALS_DIR, originalFile);

// Removes every file of a photo: the published image, its thumbnail, its
// intermediate sizes and the uploaded original. Takes a photo record, or the
// fields set by processUploadedImage.
const deletePhotoFiles = ({ filename, thumbnailFilename, originalFile }) => {
  if (filename) {
    removeIfExists(path.join(UPLOAD_DIR, filename));

    for (const size of PHOTO_SIZES) {
      removeIfExists(path.join(sizeDir(size), filename));
    }
  }

  if (thumbnailFilename) {
    removeIfExists(path.join(THUMBNAIL_DIR, thumbnailFilename));
  }

  if (originalFile) {
    removeIfExists(originalPath(originalFile));
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  processUploadedImage,
  uploadSingleDocument,
  publishImage,
  UPLOAD_DIR,
  THUMBNAIL_DIR,
  DOCUMENTS_DIR,
  ORIGINALS_DIR,
  PHOTO_SIZES,
  PUBLISHED_MIME,
  sizeDir,
  originalPath,
  deletePhotoFiles,
  writeThumbnail,
  writeSizes,
  ALLOWED_MIMES,
  ALLOWED_EXTENSIONS,
};
