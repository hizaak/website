const mongoose = require("mongoose");
const Photo = require("../../models/Photo");

const sample = (match) => Photo.aggregate([{ $match: match }, { $sample: { size: 1 } }]);

// A different photo at every visit, drawn among all the photos of the site.
// ?not=<id> leaves out the photo already shown, unless it is the only one.
exports.get = async (req, res, next) => {
  try {
    const shown = mongoose.isValidObjectId(req.query.not)
      ? new mongoose.Types.ObjectId(String(req.query.not))
      : null;

    let [photo] = shown ? await sample({ _id: { $ne: shown } }) : [];
    if (!photo) {
      [photo] = await sample({});
    }

    // Random: a cached answer would show the same photo again.
    res.set("Cache-Control", "no-store");
    res.status(200).json(
      photo
        ? {
            _id: photo._id,
            title: photo.title,
            photoDate: photo.photoDate,
            filename: photo.filename,
            width: photo.width,
            height: photo.height,
            sizes: photo.sizes,
          }
        : null
    );
  } catch (error) {
    next(error);
  }
};
