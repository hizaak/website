const Work = require("../models/Work");
const { getOrderedPhotosForWork } = require("../services/photo-order");
const { escapeXml } = require("../utils/escape");

const SITE_URL = process.env.SITE_URL || "https://www.alexandremaurice.fr";
const API_URL = process.env.PROD_URL || "https://api.alexandremaurice.fr";
const LANGS = ["fr", "en"];
// Version shown to visitors whose language is neither French nor English.
const DEFAULT_LANG = "en";

// One <url> per language, each listing every translation as an alternate.
const urlEntries = (path, extra = "") => {
  const alternates = [
    ...LANGS.map(
      (alt) => `<xhtml:link rel="alternate" hreflang="${alt}" href="${SITE_URL}/${alt}${path}"/>`
    ),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/${DEFAULT_LANG}${path}"/>`,
  ].join("");

  return LANGS.map(
    (lang) => `<url><loc>${SITE_URL}/${lang}${path}</loc>${alternates}${extra}</url>`
  );
};

exports.get = async (req, res, next) => {
  try {
    const entries = [
      ...urlEntries(""),
      ...urlEntries("/works"),
      ...urlEntries("/about"),
      ...urlEntries("/contact"),
      ...urlEntries("/legal"),
    ];

    const works = await Work.find().sort({ title: 1 });

    for (const work of works) {
      const photos = await getOrderedPhotosForWork(work._id);

      photos.forEach((photo, index) => {
        const image =
          `<image:image><image:loc>${escapeXml(`${API_URL}/uploads/${photo.filename}`)}</image:loc></image:image>`;

        // Photo numbers are 1-based in the URL.
        entries.push(...urlEntries(`/works/${escapeXml(work.slug)}/${index + 1}`, image));
      });
    }

    res
      .type("application/xml")
      .send(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
          'xmlns:xhtml="http://www.w3.org/1999/xhtml" ' +
          'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
          entries.join("\n") +
          "\n</urlset>\n"
      );
  } catch (error) {
    next(error);
  }
};
