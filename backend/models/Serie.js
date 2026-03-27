const mongoose = require("mongoose");
const { Schema } = mongoose;

const seriesSchema = new Schema({
  title: {
    type: String,
  },
  years: {
    type: String, // "2024" ou "2022-2024"
    validate: {
      validator: function (v) {
        return /^\d{4}(-\d{4})?$/.test(v);
      },
      message: (props) => `${props.value} n'est pas une année valide.`,
    },
  },
  photos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Photo",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

seriesSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

seriesSchema.pre("remove", async function (next) {
  const photos = require("./Photo");
  await photos.deleteMany({ series: this._id });
  next();
});

const Serie = mongoose.model("Serie", seriesSchema);

module.exports = Serie;
