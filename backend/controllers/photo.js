const Photo = require("../models/Photo");
const Work = require("../models/Work");
const { deletePhotoFiles } = require("../config/upload");
const {
  getNextPhotoPosition,
  getOrderedPhotosForWork,
  reorderWorkPhotos,
} = require("../services/photo-order");

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
      deletePhotoFiles(req.file);
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
      ...req.file.dimensions,
      position: await getNextPhotoPosition(work._id),
    });

    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    if (req.file) {
      deletePhotoFiles(req.file);
    }
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

    const previousFiles = {
      filename: photo.filename,
      thumbnailFilename: photo.thumbnailFilename,
    };

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
      photo.set(req.file.dimensions);
    }

    await photo.save();

    if (req.file) {
      deletePhotoFiles(previousFiles);
    }

    res.status(200).json(photo);
  } catch (error) {
    if (req.file) {
      deletePhotoFiles(req.file);
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
    deletePhotoFiles(photo);

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
