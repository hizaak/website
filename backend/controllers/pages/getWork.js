const Work = require("../../models/Work");
const { getOrderedPhotosForWork } = require("../../services/photo-order");
const { slugify } = require("../../utils/slug");

exports.getWork = async (req, res) => {
  try {
    const work = await findWorkByIdOrSlug(req.params.id);

    if (!work) {
      return res.status(404).json({
        message: "Work introuvable",
      });
    }

    const photos = await getOrderedPhotosForWork(work._id);

    res.json({
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
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

const findWorkByIdOrSlug = async (idOrSlug) => {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    const work = await Work.findById(idOrSlug);

    if (work) {
      return work;
    }
  }

  const work = await Work.findOne({ slug: idOrSlug });

  if (work) {
    return work;
  }

  const works = await Work.find();

  return works.find((item) => slugify(item.title) === idOrSlug) || null;
};
