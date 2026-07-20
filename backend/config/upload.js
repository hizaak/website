const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
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

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error("Unsupported format. Only PNG and JPEG are accepted."));
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

// Runs after multer has buffered the file in memory.
const processUploadedImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const filename = `${randomUUID()}${ext}`;

    const buffer = await encodeWithinBudget(req.file.buffer, req.file.mimetype);

    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

    req.file.filename = filename;
    req.file.size = buffer.length;

    next();
  } catch (error) {
    res.status(400).json({ message: "Unable to process image." });
  }
};

const uploadSingleImage = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    processUploadedImage(req, res, next);
  });
};

const deleteFile = (filename) => {
  if (!filename) {
    return;
  }

  const filePath = path.join(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  UPLOAD_DIR,
  deleteFile,
  ALLOWED_MIMES,
  ALLOWED_EXTENSIONS,
};
