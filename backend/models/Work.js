const mongoose = require("mongoose");
const { Schema } = mongoose;

const workSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Work = mongoose.model("Work", workSchema);

module.exports = Work;
