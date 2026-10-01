const Work = require("../models/Work");
const { slugify } = require("../utils/slug");

// "2019", "2019-2023", or "" for a work without photos.
const formatYearRange = (minYear, maxYear) => {
  if (minYear === undefined || minYear === null) {
    return "";
  }

  return minYear === maxYear ? String(minYear) : `${minYear}-${maxYear}`;
};

// Every work sorted by title, with the range of years its photos were taken.
const listWorksWithYearRange = async () => {
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
        minYear: { $year: { $min: "$photos.photoDate" } },
        maxYear: { $year: { $max: "$photos.photoDate" } },
      },
    },
    { $sort: { title: 1 } },
  ]);

  return works.map(({ minYear, maxYear, ...work }) => ({
    ...work,
    slug: work.slug || slugify(work.title),
    yearRange: formatYearRange(minYear, maxYear),
  }));
};

module.exports = { listWorksWithYearRange, formatYearRange };
