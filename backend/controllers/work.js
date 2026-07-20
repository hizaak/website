const Work = require("../models/Work");
const Photo = require("../models/Photo");
const { deleteFile } = require("../config/upload");
const { findWorkByIdOrSlug } = require("../services/work-lookup");
const { slugify } = require("../utils/slug");

exports.getAll = async (req, res) => {
  try {
    const works = await Work.aggregate([
      {
        $lookup: {
          from: "photos",
          localField: "_id",
          foreignField: "workId",
          as: "photos",
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          createdAt: 1,
          updatedAt: 1,
          years: {
            $map: {
              input: "$photos",
              as: "photo",
              in: {
                $toInt: {
                  $arrayElemAt: [
                    { $split: ["$$photo.photoDate", "/"] },
                    2,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          createdAt: 1,
          updatedAt: 1,
          minYear: { $min: "$years" },
          maxYear: { $max: "$years" },
        },
      },
      {
        $addFields: {
          yearRange: {
            $cond: [
              { $eq: ["$minYear", null] },
              "",
              {
                $cond: [
                  { $eq: ["$minYear", "$maxYear"] },
                  { $toString: "$minYear" },
                  {
                    $concat: [
                      { $toString: "$minYear" },
                      "-",
                      { $toString: "$maxYear" },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $sort: {
          title: 1,
        },
      },
    ]);
    res.status(200).json(
      works.map((work) => ({
        ...work,
        slug: work.slug || slugify(work.title),
      }))
    );
  } catch (error) {
    console.error("Error fetching works:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.get = async (req, res) => {
  try {
    const work = await findWorkByIdOrSlug(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }
    res.status(200).json(work);
  } catch (error) {
    console.error("Error fetching work:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.create = async (req, res) => {
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
    console.error("Error creating work:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.update = async (req, res) => {
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
    console.error("Error updating work:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: "Work not found." });
    }

    const photos = await Photo.find({ workId: work._id });
    for (const photo of photos) {
      deleteFile(photo.filename);
    }
    await Photo.deleteMany({ workId: work._id });
    await Work.findByIdAndDelete(work._id);

    res.status(200).json({ message: "Work deleted." });
  } catch (error) {
    console.error("Error deleting work:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
