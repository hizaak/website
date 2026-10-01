const { listWorksWithYearRange } = require("../../services/work-years");

exports.getAll = async (req, res, next) => {
  try {
    const works = await listWorksWithYearRange();

    res.status(200).json(
      works.map(({ _id, title, slug, yearRange }) => ({ _id, title, slug, yearRange }))
    );
  } catch (error) {
    next(error);
  }
};
