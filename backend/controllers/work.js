const Work = require("../models/Work");
const Photo = require("../models/Photo");
const { deletePhotoFiles } = require("../config/upload");
const { findWorkByIdOrSlug } = require("../services/work-lookup");
const { slugify } = require("../utils/slug");
const { listWorksWithYearRange } = require("../services/work-years");

exports.getAll = async (req, res, next) => {
  try {
    res.status(200).json(await listWorksWithYearRange());
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const work = await findWorkByIdOrSlug(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }
    res.status(200).json(work);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const slug = slugify(req.body.title);
    const existingWork = await findWorkByIdOrSlug(slug);

    if (existingWork) {
      return res.status(409).json({ message: "This slug already exists." });
    }

    const work = new Work({
      ...req.body,
      slug,
    });
    await work.save();
    res.status(201).json(work);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This title already exists." });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const nextBody = { ...req.body };

    if (nextBody.title) {
      nextBody.slug = slugify(nextBody.title);

      const existingWork = await findWorkByIdOrSlug(nextBody.slug);

      if (existingWork && String(existingWork._id) !== req.params.id) {
        return res.status(409).json({ message: "This slug already exists." });
      }
    }

    const work = await Work.findByIdAndUpdate(req.params.id, nextBody, {
      new: true,
      runValidators: true,
    });
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }
    res.status(200).json(work);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This title already exists." });
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }

    const photos = await Photo.find({ workId: work._id });
    await Photo.deleteMany({ workId: work._id });
    await Work.findByIdAndDelete(work._id);

    // Files go last, so that a failed database write never leaves records
    // pointing to deleted images.
    for (const photo of photos) {
      deletePhotoFiles(photo);
    }

    res.status(200).json({ message: "Work deleted." });
  } catch (error) {
    next(error);
  }
};
