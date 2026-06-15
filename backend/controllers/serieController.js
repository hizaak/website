const Serie = require("../models/Serie");

exports.getAll = async (req, res) => {
  try {
    const series = await Serie.find();
    res.status(200).json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const serie = await Serie.findById(req.params.id);
    if (!serie) {
      return res.status(404).json({ message: "Série introuvable." });
    }
    res.status(200).json(serie);
  } catch (error) {
    console.error("Error fetching serie:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const serie = new Serie(req.body);
    await serie.save();
    res.status(201).json(serie);
  } catch (error) {
    console.error("Error creating serie:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const serie = await Serie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!serie) {
      return res.status(404).json({ message: "Série introuvable." });
    }
    res.status(200).json({ message: "Série mise à jour.", serie });
  } catch (error) {
    console.error("Error updating serie:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const serie = await Serie.findByIdAndDelete(req.params.id);
    if (!serie) {
      return res.status(404).json({ message: "Série introuvable." });
    }
    res.status(200).json({ message: "Série supprimée." });
  } catch (error) {
    console.error("Error deleting serie:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
