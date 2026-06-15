const Photo = require("../models/Photo");

exports.create = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Fichier manquant." });
  }

  const filename = req.file.originalname;
  let path;

  try {
    if (req.body.serie) {
      const Serie = require("../models/Serie");
      const serie = await Serie.findById(req.body.serie);

      if (!serie) {
        return res.status(404).json({ message: "Série introuvable." });
      }

      path =
        process.env.NODE_ENV === "production"
          ? `${process.env.PROD_URL}/photos/${serie.name}/${filename}`
          : `${process.env.DEV_URL}/photos/${serie.name}/${filename}`;
    } else {
      path =
        process.env.NODE_ENV === "production"
          ? `${process.env.PROD_URL}/photos/${filename}`
          : `${process.env.DEV_URL}/photos/${filename}`;
    }

    const existingPhoto = await Photo.findOne({ title: req.body.title });
    if (existingPhoto) {
      return res.status(409).json({ message: "Nom déjà utilisé." });
    }

    const photo = new Photo({ ...req.body, path });
    await photo.save();

    res.status(201).json(photo);
  } catch (error) {
    console.error("Error creating photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.getRandomPhoto = async (req, res) => {
  try {
    const randomPhoto = await Photo.aggregate([{ $sample: { size: 1 } }]);
    if (randomPhoto.length === 0) {
      return res.status(404).json({ message: "Aucune photo trouvée." });
    }
    res.status(200).json(randomPhoto[0]);
  } catch (error) {
    console.error("Error fetching random photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const photos = await Photo.find();
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
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
    const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable." });
    }
    res.status(200).json({ message: "Photo mise à jour.", photo });
  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo introuvable." });
    }
    res.status(200).json({ message: "Photo supprimée." });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
