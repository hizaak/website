const Work = require("../../models/Work");
const { slugify } = require("../../utils/slug");

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
          years: {
            $map: {
              input: "$photos",
              as: "photo",
              in: {
                $toInt: {
                  $arrayElemAt: [
                    {
                      $split: ["$$photo.photoDate", "/"],
                    },
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
          minYear: { $min: "$years" },
          maxYear: { $max: "$years" },
        },
      },
      {
        $sort: {
          title: 1,
        },
      },
    ]);

    const result = works.map((work) => ({
      _id: work._id,
      title: work.title,
      slug: work.slug || slugify(work.title),
      yearRange: getYearRange(work.minYear, work.maxYear),
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Server error.",
      error: error.message,
    });
  }
};

const getYearRange = (minYear, maxYear) => {
  if (minYear === undefined || minYear === null) {
    return "";
  }

  if (minYear === maxYear) {
    return String(minYear);
  }

  return `${minYear}-${maxYear}`;
};
