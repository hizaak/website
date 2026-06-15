const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    photoDate: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
