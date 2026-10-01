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

// Intermediate versions served through srcset, so that a phone doesn't
// download the full-size original. Each is a long-edge box: a photo smaller
// than the box doesn't get that version.
const PHOTO_SIZES = [1280, 2048];
const SIZE_JPEG_QUALITY = 86;
const SIZE_PNG_QUALITY = 90;

const sizeDir = (size) => path.join(SIZES_DIR, String(size));

for (const dir of [UPLOAD_DIR, THUMBNAIL_DIR, DOCUMENTS_DIR, ...PHOTO_SIZES.map(sizeDir)]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const ALLOWED_MIMES = ["image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

// Long-edge ladder, largest first. At each step we retry at decreasing
// encode quality until the file fits MAX_OUTPUT_BYTES, only dropping to a
// smaller dimension if even the lowest quality at the current size doesn't.
// Keeps quality as high as possible for a given hard size budget, which
// matters for detail-critical landscape work on a small VPS (2 vCore/2GB).
const DIMENSION_STEPS = [3840, 3200, 2600, 2000];
const JPEG_QUALITY_STEPS = [92, 84, 76, 66, 50];
const PNG_QUALITY_STEPS = [100, 90, 80, 65, 50];
const MAX_OUTPUT_BYTES = 3 * 1024 * 1024;

// Small preview used by the admin photo lists, so the browser doesn't have
// to decode dozens of full-resolution originals at once.
const THUMBNAIL_MAX_DIMENSION = 300;
const THUMBNAIL_JPEG_QUALITY = 80;
const THUMBNAIL_PNG_QUALITY = 90;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
    const error = new Error("Unsupported format. Only PNG and JPEG are accepted.");
    error.code = "IMAGE_FORMAT_UNSUPPORTED";
    return cb(error);
  }

  cb(null, true);
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Bakes in EXIF orientation, strips all metadata (GPS included), normalizes
// to sRGB, then walks the dimension/quality ladder until the encode fits
// MAX_OUTPUT_BYTES. Returns the smallest attempt found if the budget can't
// be hit even at the floor settings (near-impossible for real photos).
const encodeWithinBudget = async (buffer, mimeType) => {
  let smallest = null;

  for (const dimension of DIMENSION_STEPS) {
    const base = sharp(buffer)
      .rotate()
      .resize(dimension, dimension, { fit: "inside", withoutEnlargement: true })
      .toColorspace("srgb");

    const qualitySteps = mimeType === "image/png" ? PNG_QUALITY_STEPS : JPEG_QUALITY_STEPS;

    for (const quality of qualitySteps) {
      const output =
        mimeType === "image/png"
          ? await base
              .clone()
              .png({ quality, palette: quality < 100, compressionLevel: 9, effort: 10 })
              .toBuffer()
          : await base.clone().jpeg({ quality, mozjpeg: true }).toBuffer();

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
const encodeThumbnail = async (buffer, mimeType) => {
  const base = sharp(buffer)
    .resize(THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toColorspace("srgb");

  return mimeType === "image/png"
    ? base.png({ quality: THUMBNAIL_PNG_QUALITY, palette: true, compressionLevel: 9 }).toBuffer()
    : base.jpeg({ quality: THUMBNAIL_JPEG_QUALITY, mozjpeg: true }).toBuffer();
};

const writeThumbnail = async (buffer, mimeType, filename) => {
  const thumbnailBuffer = await encodeThumbnail(buffer, mimeType);
  fs.writeFileSync(path.join(THUMBNAIL_DIR, filename), thumbnailBuffer);
};

// Writes every intermediate size smaller than the processed image, and
// returns its dimensions along with the sizes written.
const writeSizes = async (buffer, mimeType, filename) => {
  const { width, height } = await sharp(buffer).metadata();
  const sizes = [];

  for (const size of PHOTO_SIZES.filter((size) => size < Math.max(width, height))) {
    const base = sharp(buffer).resize(size, size, { fit: "inside" });
    const { data, info } = await (mimeType === "image/png"
      ? base.png({ quality: SIZE_PNG_QUALITY, palette: true, compressionLevel: 9 })
      : base.jpeg({ quality: SIZE_JPEG_QUALITY, mozjpeg: true })
    ).toBuffer({ resolveWithObject: true });

    fs.writeFileSync(path.join(sizeDir(size), filename), data);
    sizes.push({ size, width: info.width, height: info.height });
  }

  return { width, height, sizes };
};

// Runs after multer has buffered the file in memory and after the other
// fields have been validated, so that an invalid request never leaves files
// behind nor costs an encode.
const processUploadedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const filename = `${randomUUID()}${ext}`;

  try {

    const buffer = await encodeWithinBudget(req.file.buffer, req.file.mimetype);

    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    await writeThumbnail(buffer, req.file.mimetype, filename);
    const { width, height, sizes } = await writeSizes(buffer, req.file.mimetype, filename);

    req.file.filename = filename;
    req.file.thumbnailFilename = filename;
    req.file.size = buffer.length;
    req.file.dimensions = { width, height, sizes };

    next();
  } catch (error) {
    console.error("Error processing uploaded image:", error);
    deletePhotoFiles({ filename, thumbnailFilename: filename });
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

// Removes every file of a photo: the original, its thumbnail and its
// intermediate sizes. Takes a photo record, or the file fields of an upload.
const deletePhotoFiles = ({ filename, thumbnailFilename }) => {
  if (filename) {
    removeIfExists(path.join(UPLOAD_DIR, filename));

    for (const size of PHOTO_SIZES) {
      removeIfExists(path.join(sizeDir(size), filename));
    }
  }

  if (thumbnailFilename) {
    removeIfExists(path.join(THUMBNAIL_DIR, thumbnailFilename));
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  processUploadedImage,
  uploadSingleDocument,
  UPLOAD_DIR,
  THUMBNAIL_DIR,
  DOCUMENTS_DIR,
  PHOTO_SIZES,
  sizeDir,
  deletePhotoFiles,
  writeThumbnail,
  writeSizes,
  ALLOWED_MIMES,
  ALLOWED_EXTENSIONS,
};
