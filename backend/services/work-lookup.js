const Work = require("../models/Work");
const { slugify } = require("../utils/slug");

const findWorkByIdOrSlug = async (idOrSlug) => {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    const work = await Work.findById(idOrSlug);

    if (work) {
      return work;
    }
  }

  const work = await Work.findOne({ slug: idOrSlug });

  if (work) {
    return work;
  }

  const works = await Work.find();

  return works.find((item) => slugify(item.title) === idOrSlug) || null;
};

module.exports = { findWorkByIdOrSlug };
