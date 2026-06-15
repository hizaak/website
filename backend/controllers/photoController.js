const Photo = require("../models/Photo");
const Work = require("../models/Work");
const { deleteFile } = require("../config/upload");

exports.getByWorkId = async (req, res) => {
  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      return res.status(404).json({ message: "Work introuvable." });
    }

    const photos = await Photo.find({ workId: req.params.workId }).sort({
      photoDate: 1,
      title: 1,
    });
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos by work:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.create = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Fichier image manquant." });
  }

  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      deleteFile(req.file.filename);
      return res.status(404).json({ message: "Work introuvable." });
    }

    const photo = new Photo({
      workId: work._id,
      title: req.body.title,
      photoDate: req.body.photoDate,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.filename);
    }
    console.error("Error creating photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable." });
    }
    res.status(200).json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable." });
    }

    const previousFilename = photo.filename;

    if (req.body.title !== undefined) {
      photo.title = req.body.title;
    }
    if (req.body.photoDate !== undefined) {
      photo.photoDate = req.body.photoDate;
    }

    if (req.file) {
      photo.filename = req.file.filename;
      photo.originalFilename = req.file.originalname;
      photo.mimeType = req.file.mimetype;
    }

    await photo.save();

    if (req.file && previousFilename !== photo.filename) {
      deleteFile(previousFilename);
    }

    res.status(200).json(photo);
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.filename);
    }
    console.error("Error updating photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable." });
    }

    deleteFile(photo.filename);
    await Photo.findByIdAndDelete(photo._id);

    res.status(200).json({ message: "Photo supprimée." });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
