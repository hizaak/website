const Photo = require("../models/Photo");

exports.create = async (req, res) => {
  const filename = req.file.originalname;
  let path;

  try {
    if (req.body.serie) {
      const Serie = require("../models/Serie");
      const serie = await Serie.findById(req.body.serie);

      if (!serie) {
        return res.status(400).json({ message: "Série introuvable." });
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
      return res.status(400).json({ message: "Nom déjà utilisé." });
    }

    const photo = new Photo({ ...req.body, path });
    await photo.save();

    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.getRandomPhoto = async (req, res) => {
  try {
    const randomPhoto = await Photo.aggregate([{ $sample: { size: 1 } }]);
    res.json(randomPhoto[0]);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.getAll = async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.get = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    res.json(photo);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.update = async (req, res) => {
  try {
    await Photo.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Photo mise à jour." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

exports.delete = async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.id);
    res.json({ message: "Photo supprimée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};
