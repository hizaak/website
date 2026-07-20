const Photo = require("../models/Photo");
const Work = require("../models/Work");
const { deleteFile, deleteThumbnail } = require("../config/upload");
const {
  getNextPhotoPosition,
  getOrderedPhotosForWork,
  reorderWorkPhotos,
} = require("../services/photo-order");

exports.getByWorkId = async (req, res) => {
  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }

    const photos = await getOrderedPhotosForWork(req.params.workId);
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching photos by work:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.create = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is missing." });
  }

  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      deleteFile(req.file.filename);
      deleteThumbnail(req.file.thumbnailFilename);
      return res.status(404).json({ message: "Work not found." });
    }

    const photo = new Photo({
      workId: work._id,
      title: req.body.title,
      photoDate: req.body.photoDate,
      filename: req.file.filename,
      thumbnailFilename: req.file.thumbnailFilename,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      position: await getNextPhotoPosition(work._id),
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.filename);
      deleteThumbnail(req.file.thumbnailFilename);
    }
    console.error("Error creating photo:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }
    res.status(200).json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }

    const previousFilename = photo.filename;
    const previousThumbnailFilename = photo.thumbnailFilename;

    if (req.body.title !== undefined) {
      photo.title = req.body.title;
    }
    if (req.body.photoDate !== undefined) {
      photo.photoDate = req.body.photoDate;
    }

    if (req.file) {
      photo.filename = req.file.filename;
      photo.thumbnailFilename = req.file.thumbnailFilename;
      photo.originalFilename = req.file.originalname;
      photo.mimeType = req.file.mimetype;
    }

    await photo.save();

    if (req.file && previousFilename !== photo.filename) {
      deleteFile(previousFilename);
      deleteThumbnail(previousThumbnailFilename);
    }

    res.status(200).json(photo);
  } catch (error) {
    if (req.file) {
      deleteFile(req.file.filename);
      deleteThumbnail(req.file.thumbnailFilename);
    }
    console.error("Error updating photo:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }

    deleteFile(photo.filename);
    deleteThumbnail(photo.thumbnailFilename);
    await Photo.findByIdAndDelete(photo._id);

    res.status(200).json({ message: "Photo deleted." });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.reorder = async (req, res) => {
  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }

    const photos = await reorderWorkPhotos(work._id, req.body.photoIds);

    if (!photos) {
      return res.status(400).json({
        message: "The photo list does not match this work.",
      });
    }

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error reordering photos:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
