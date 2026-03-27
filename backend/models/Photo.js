const mongoose = require("mongoose");
const { Schema } = mongoose;

const photoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  path: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  serie: {
    type: Schema.Types.ObjectId,
    ref: "Serie",
    required: true,
  },
  timestamps: true,
});

photoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

photoSchema.pre("remove", async function (next) {
  const Serie = require("./Serie");

  await Serie.updateMany({ photos: this._id }, { $pull: { photos: this._id } });
  next();
});

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
