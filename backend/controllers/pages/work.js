const { getOrderedPhotosForWork } = require("../../services/photo-order");
const { findWorkByIdOrSlug } = require("../../services/work-lookup");
const { slugify } = require("../../utils/slug");

exports.get = async (req, res) => {
  try {
    const work = await findWorkByIdOrSlug(req.params.id);

    if (!work) {
      return res.status(404).json({
        message: "Work not found.",
      });
    }

    const photos = await getOrderedPhotosForWork(work._id);

    res.status(200).json({
      _id: work._id,
      title: work.title,
      slug: work.slug || slugify(work.title),
      photos: photos.map((photo) => ({
        _id: photo._id,
        title: photo.title,
        photoDate: photo.photoDate,
        filename: photo.filename,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};
