const { response } = require("./helpers");

const tag = { name: "SEO", description: "Sitemap and link previews" };

const paths = {
  "/sitemap.xml": {
    get: {
      tags: [tag.name],
      summary: "Sitemap of the site",
      description:
        "Every page in French and English, with one entry per photo. Also served at https://alexandremaurice.fr/sitemap.xml.",
      responses: {
        200: {
          description: "Sitemap",
          content: { "application/xml": { schema: { type: "string" } } },
        },
        500: response("ServerError"),
      },
    },
  },
  "/__preview/{path}": {
    get: {
      tags: [tag.name],
      summary: "Page for link-preview bots",
      description: [
        "Minimal HTML page with the title, description and image of a site page.",
        "The site's nginx sends WhatsApp, Discord, Facebook... here instead of the Angular app.",
        "`path` is the page's path, e.g. `fr/works/gavarnie/3`, `en/about` (empty for the home page).",
      ].join(" "),
      parameters: [
        {
          name: "path",
          in: "path",
          required: true,
          description: "Path of the site page, e.g. fr/works/gavarnie/3",
          schema: { type: "string" },
          allowReserved: true,
        },
      ],
      responses: {
        200: {
          description: "HTML with meta tags",
          content: { "text/html": { schema: { type: "string" } } },
        },
        500: response("ServerError"),
      },
    },
  },
};

module.exports = { tag, schemas: {}, paths };
