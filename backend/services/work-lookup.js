const Work = require("../models/Work");
const { slugify } = require("../utils/slug");

const findWorkByIdOrSlug = async (idOrSlug) => {
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    const work = await Work.findById(idOrSlug);

    if (work) {
      return work;
    }
  }

  return Work.findOne({ slug: idOrSlug });
};

// One-off migration: works created before slugs were stored get theirs, so
// that lookups by slug never have to scan every work.
const backfillWorkSlugs = async () => {
  const works = await Work.find({ $or: [{ slug: null }, { slug: "" }] });

  for (const work of works) {
    work.slug = slugify(work.title);
    await work.save();
  }

  if (works.length) {
    console.log(`Slug backfill: ${works.length} work(s) updated.`);
  }
};

module.exports = { findWorkByIdOrSlug, backfillWorkSlugs };
