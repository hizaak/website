const mongoose = require("mongoose");
const { Schema } = mongoose;

// An intermediate version of the photo (see PHOTO_SIZES in config/upload.js),
// served from /uploads/sizes/<size>/<filename>.
const photoSizeSchema = new Schema(
  {
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

const photoSchema = new Schema(
  {
    workId: {
      type: Schema.Types.ObjectId,
      ref: "Work",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Day the photo was taken, stored at midnight UTC.
    photoDate: {
      type: Date,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    thumbnailFilename: {
      type: String,
    },
    // Name of the file as uploaded, given back when the original is downloaded.
    originalFilename: {
      type: String,
      required: true,
    },
    // The uploaded file itself, kept in ORIGINALS_DIR (see config/upload.js).
    // Missing for photos uploaded before originals were kept.
    originalFile: {
      type: String,
    },
    // Type of the published image: always JPEG, except legacy PNGs not yet
    // converted at startup.
    mimeType: {
      type: String,
      required: true,
    },
    // Dimensions of the stored original.
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    sizes: {
      type: [photoSizeSchema],
      default: undefined,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
