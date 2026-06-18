const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIMES = ["image/png", "image/jpeg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error("Format non autorisé. Seuls PNG et JPEG sont acceptés."));
  }

  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadSingleImage = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    next();
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
