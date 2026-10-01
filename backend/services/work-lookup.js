const Work = require("../models/Work");

const findWorkByIdOrSlug = async (idOrSlug) => {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    const work = await Work.findById(idOrSlug);

    if (work) {
      return work;
    }
  }

  return Work.findOne({ slug: idOrSlug });
};

module.exports = { findWorkByIdOrSlug };
