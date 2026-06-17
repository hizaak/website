const Work = require("../../models/Work");
const Photo = require("../../models/Photo");

exports.getWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        message: "Work introuvable",
      });
    }

    const photos = await Photo.find({
      workId: work._id,
    }).sort({
      photoDate: 1,
      title: 1,
    });

    res.json({
      _id: work._id,
      title: work.title,
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