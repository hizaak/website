const Work = require("../../models/Work");

exports.getWorksPage = async (req, res) => {
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
      yearRange:
        work.minYear === work.maxYear
          ? String(work.minYear)
          : `${work.minYear}-${work.maxYear}`,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};