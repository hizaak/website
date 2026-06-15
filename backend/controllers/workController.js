const Work = require("../models/Work");
const Photo = require("../models/Photo");
const { deleteFile } = require("../config/upload");

exports.getAll = async (req, res) => {
  try {
    const works = await Work.find().sort({ title: 1 });
    res.status(200).json(works);
  } catch (error) {
    console.error("Error fetching works:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Work introuvable." });
    }
    res.status(200).json(work);
  } catch (error) {
    console.error("Error fetching work:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const work = new Work(req.body);
    await work.save();
    res.status(201).json(work);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ce titre existe déjà." });
    }
    console.error("Error creating work:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const work = await Work.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!work) {
      return res.status(404).json({ message: "Work introuvable." });
    }
    res.status(200).json(work);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Ce titre existe déjà." });
    }
    console.error("Error updating work:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Work introuvable." });
    }

    const photos = await Photo.find({ workId: work._id });
    for (const photo of photos) {
      deleteFile(photo.filename);
    }
    await Photo.deleteMany({ workId: work._id });
    await Work.findByIdAndDelete(work._id);

    res.status(200).json({ message: "Work supprimé." });
  } catch (error) {
    console.error("Error deleting work:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
