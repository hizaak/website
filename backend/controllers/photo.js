const fs = require("fs");
const Photo = require("../models/Photo");
const Work = require("../models/Work");
const { deletePhotoFiles, originalPath } = require("../config/upload");
const {
  getNextPhotoPosition,
  getOrderedPhotosForWork,
  normalizePhotoOrder,
  reorderWorkPhotos,
} = require("../services/photo-order");

// The fields of a photo record that name its files.
const filesOf = (photo) => ({
  filename: photo.filename,
  thumbnailFilename: photo.thumbnailFilename,
  originalFile: photo.originalFile,
});

exports.getByWorkId = async (req, res, next) => {
  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }

    const photos = await getOrderedPhotosForWork(req.params.workId);
    res.status(200).json(photos);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is missing." });
  }

  try {
    const work = await Work.findById(req.params.workId);
    if (!work) {
      deletePhotoFiles(req.file.photo);
      return res.status(404).json({ message: "Work not found." });
    }

    const photo = new Photo({
      workId: work._id,
      title: req.body.title,
      photoDate: req.body.photoDate,
      ...req.file.photo,
      position: await getNextPhotoPosition(work._id),
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    if (req.file?.photo) {
      deletePhotoFiles(req.file.photo);
    }
    next(error);
  }
};

// Admin only: the file exactly as it was uploaded.
exports.downloadOriginal = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }

    if (!photo.originalFile || !fs.existsSync(originalPath(photo.originalFile))) {
      return res.status(404).json({ message: "No original kept for this photo." });
    }

    res.set("Cache-Control", "private, no-store");
    res.download(originalPath(photo.originalFile), photo.originalFilename);
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }
    res.status(200).json(photo);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }

    const previousFiles = filesOf(photo);

    if (req.body.title !== undefined) {
      photo.title = req.body.title;
    }
    if (req.body.photoDate !== undefined) {
      photo.photoDate = req.body.photoDate;
    }

    if (req.file) {
      photo.set(req.file.photo);
    }

    await photo.save();

    if (req.file) {
      deletePhotoFiles(previousFiles);
    }

    res.status(200).json(photo);
  } catch (error) {
    if (req.file?.photo) {
      deletePhotoFiles(req.file.photo);
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found." });
    }

    // Files go last, so that a failed database write never leaves a record
    // pointing to a deleted image.
    await Photo.findByIdAndDelete(photo._id);
    await normalizePhotoOrder(photo.workId);
    deletePhotoFiles(filesOf(photo));

    res.status(200).json({ message: "Photo deleted." });
  } catch (error) {
    next(error);
  }
};

exports.reorder = async (req, res, next) => {
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
    next(error);
  }
};
