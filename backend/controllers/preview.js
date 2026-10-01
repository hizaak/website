const { getOrderedPhotosForWork } = require("../services/photo-order");
const { findWorkByIdOrSlug } = require("../services/work-lookup");
const Work = require("../models/Work");
const { escapeXml } = require("../utils/escape");

const SITE_URL = process.env.SITE_URL || "https://alexandremaurice.fr";
const API_URL = process.env.PROD_URL || "https://api.alexandremaurice.fr";

// Same texts as the "seo" block of frontend/public/i18n/*.json.
const TEXTS = {
  fr: {
    locale: "fr_FR",
    works: { title: "alexandre maurice | travaux", description: "Photographies de paysages des Pyrénées par Alexandre Maurice." },
    work: { title: "alexandre maurice | travaux - {{work}}", description: "{{work}} : photographies de paysage d'Alexandre Maurice." },
    about: { title: "alexandre maurice | à propos", description: "Alexandre Maurice photographie les paysages des Pyrénées. Qui je suis et pourquoi ce site existe." },
    contact: { title: "alexandre maurice | contact", description: "Contacter Alexandre Maurice au sujet de son travail de photographe ou à titre professionnel." },
  },
  en: {
    locale: "en_US",
    works: { title: "alexandre maurice | works", description: "Landscape photographs of the Pyrenees by Alexandre Maurice." },
    work: { title: "alexandre maurice | works - {{work}}", description: "{{work}}: landscape photographs by Alexandre Maurice." },
    about: { title: "alexandre maurice | about", description: "Alexandre Maurice photographs the landscapes of the Pyrenees. Who I am and why this site exists." },
    contact: { title: "alexandre maurice | contact", description: "Contact Alexandre Maurice about his landscape photography or any professional matter." },
  },
};

// Link previews are small: the smallest intermediate size is plenty, and
// much lighter than the original.
const photoUrl = (photo) => {
  const [smallest] = photo.sizes || [];
  return smallest
    ? `${API_URL}/uploads/sizes/${smallest.size}/${photo.filename}`
    : `${API_URL}/uploads/${photo.filename}`;
};

// Pages without their own photo show the first photo of the first work.
const defaultImage = async () => {
  const [work] = await Work.find().sort({ title: 1 }).limit(1);
  if (!work) {
    return null;
  }

  const [photo] = await getOrderedPhotosForWork(work._id);
  return photo ? photoUrl(photo) : null;
};

// Page metadata for a site URL such as /fr/works/pyrenees/3.
const describe = async (path) => {
  const [first, section, slug, number] = path.split("/").filter(Boolean);
  const lang = first === "fr" ? "fr" : "en";
  const texts = TEXTS[lang];

  if (section === "works" && slug) {
    const work = await findWorkByIdOrSlug(slug);

    if (work) {
      const photos = await getOrderedPhotosForWork(work._id);
      // Photo numbers are 1-based in the URL.
      const photo = photos[Number(number) - 1] || photos[0];

      return {
        lang,
        locale: texts.locale,
        title: texts.work.title.replace("{{work}}", work.title),
        description: texts.work.description.replace("{{work}}", work.title),
        image: photo ? photoUrl(photo) : await defaultImage(),
      };
    }
  }

  const page = texts[section] && section !== "work" ? texts[section] : texts.works;

  return {
    lang,
    locale: texts.locale,
    title: page.title,
    description: page.description,
    image: await defaultImage(),
  };
};

// Served by nginx instead of the Angular app to link-preview bots
// (WhatsApp, Discord...), which read meta tags but don't run JavaScript.
exports.get = async (req, res, next) => {
  try {
    const page = await describe(req.path);
    const url = `${SITE_URL}${req.path}`;

    const meta = [
      ["name", "description", page.description],
      ["property", "og:site_name", "alexandre maurice"],
      ["property", "og:type", "website"],
      ["property", "og:locale", page.locale],
      ["property", "og:url", url],
      ["property", "og:title", page.title],
      ["property", "og:description", page.description],
      ["name", "twitter:card", page.image ? "summary_large_image" : "summary"],
      ...(page.image ? [["property", "og:image", page.image]] : []),
    ]
      .map(([attribute, key, value]) => `<meta ${attribute}="${key}" content="${escapeXml(value)}">`)
      .join("\n    ");

    res.type("html").send(`<!DOCTYPE html>
<html lang="${page.lang}">
  <head>
    <meta charset="utf-8">
    <title>${escapeXml(page.title)}</title>
    <link rel="canonical" href="${escapeXml(url)}">
    ${meta}
  </head>
  <body></body>
</html>
`);
  } catch (error) {
    next(error);
  }
};
