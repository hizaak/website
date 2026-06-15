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
  },
  {
    timestamps: true,
  }
);

const Work = mongoose.model("Work", workSchema);

module.exports = Work;
