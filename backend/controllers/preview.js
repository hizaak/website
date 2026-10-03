const { getOrderedPhotosForWork } = require("../services/photo-order");
const { findWorkByIdOrSlug } = require("../services/work-lookup");
const Work = require("../models/Work");
const { escapeXml } = require("../utils/escape");

const SITE_URL = process.env.SITE_URL || "https://www.alexandremaurice.fr";
const API_URL = process.env.PROD_URL || "https://api.alexandremaurice.fr";

// Same texts as the "seo" block of frontend/src/i18n/*.json.
const TEXTS = {
  fr: {
    locale: "fr_FR",
    home: { title: "alexandre maurice | accueil", description: "Site d'Alexandre Maurice, photographe de paysage. Photographies des Pyrénées." },
    pages: {
      works: { title: "alexandre maurice | travaux", description: "Photographies de paysages des Pyrénées par Alexandre Maurice." },
      about: { title: "alexandre maurice | à propos", description: "Alexandre Maurice photographie les paysages des Pyrénées. Qui je suis et pourquoi ce site existe." },
      contact: { title: "alexandre maurice | contact", description: "Contacter Alexandre Maurice au sujet de son travail de photographe ou à titre professionnel." },
      legal: { title: "alexandre maurice | mentions légales", description: "Mentions légales du site alexandremaurice.fr." },
    },
    work: { title: "alexandre maurice | travaux - {{work}}", description: "{{work}} : photographies de paysage d'Alexandre Maurice." },
  },
  en: {
    locale: "en_US",
    home: { title: "alexandre maurice | home", description: "Website of Alexandre Maurice, landscape photographer. Photographs of the Pyrenees." },
    pages: {
      works: { title: "alexandre maurice | works", description: "Landscape photographs of the Pyrenees by Alexandre Maurice." },
      about: { title: "alexandre maurice | about", description: "Alexandre Maurice photographs the landscapes of the Pyrenees. Who I am and why this site exists." },
      contact: { title: "alexandre maurice | contact", description: "Contact Alexandre Maurice about his landscape photography or any professional matter." },
      legal: { title: "alexandre maurice | legal notice", description: "Legal notice of alexandremaurice.fr." },
    },
    work: { title: "alexandre maurice | works - {{work}}", description: "{{work}}: landscape photographs by Alexandre Maurice." },
  },
};

// Link previews are small: the smallest intermediate size is plenty, and
// much lighter than the full image.
const previewImage = (photo) => {
  const [smallest] = photo.sizes || [];
  return smallest
    ? {
        url: `${API_URL}/uploads/sizes/${smallest.size}/${photo.filename}`,
        width: smallest.width,
        height: smallest.height,
        alt: photo.title,
      }
    : {
        url: `${API_URL}/uploads/${photo.filename}`,
        width: photo.width,
        height: photo.height,
        alt: photo.title,
      };
};

// Pages without their own photo show the first photo of the first work.
const defaultImage = async () => {
  const [work] = await Work.find().sort({ title: 1 }).limit(1);
  if (!work) {
    return null;
  }

  const [photo] = await getOrderedPhotosForWork(work._id);
  return photo ? previewImage(photo) : null;
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
        image: photo ? previewImage(photo) : await defaultImage(),
      };
    }
  }

  // The home page (/, /fr, /en), and any other address.
  const page = Object.hasOwn(texts.pages, section) ? texts.pages[section] : texts.home;

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
    const image = page.image;

    const meta = [
      ["name", "description", page.description],
      ["property", "og:site_name", "Alexandre Maurice"],
      ["property", "og:type", "website"],
      ["property", "og:locale", page.locale],
      ["property", "og:url", url],
      ["property", "og:title", page.title],
      ["property", "og:description", page.description],
      ["name", "twitter:card", image ? "summary_large_image" : "summary"],
      ...(image
        ? [
            ["property", "og:image", image.url],
            ...(image.width ? [["property", "og:image:width", image.width]] : []),
            ...(image.height ? [["property", "og:image:height", image.height]] : []),
            ["property", "og:image:alt", image.alt],
          ]
        : []),
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

// Asked by nginx (auth_request) before serving the page of a work, so that
// an unknown work gets a real 404 status rather than a 200 page saying "not
// found". auth_request only understands 2xx and 401/403: 403 means "no such
// work", and nginx turns it into a 404.
exports.exists = async (req, res, next) => {
  try {
    const [, section, slug] = req.path.split("/").filter(Boolean);
    const exists = section === "works" && slug && (await findWorkByIdOrSlug(slug));

    res.status(exists ? 204 : 403).end();
  } catch (error) {
    next(error);
  }
};
