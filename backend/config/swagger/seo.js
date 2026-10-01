const { response, pathParam } = require("./helpers");

const tag = { name: "SEO", description: "Sitemap and link previews" };

const lang = {
  name: "lang",
  in: "path",
  required: true,
  description: "Language of the page; anything but fr gives English.",
  schema: { type: "string", enum: ["fr", "en"] },
};

const preview = (summary, parameters) => ({
  get: {
    tags: [tag.name],
    summary,
    description: [
      "Minimal HTML page with the title, description and image of a site page.",
      "The site's nginx sends WhatsApp, Discord, Facebook... to `/__preview/<path of the page>`",
      "instead of the Angular app. An unknown page or work gives the works page.",
    ].join(" "),
    parameters,
    responses: {
      200: {
        description: "HTML with meta tags",
        content: { "text/html": { schema: { type: "string" } } },
      },
      500: response("ServerError"),
    },
  },
});

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
  "/__preview/{lang}/{page}": preview("Link preview of a page", [
    lang,
    {
      name: "page",
      in: "path",
      required: true,
      schema: { type: "string", enum: ["works", "about", "contact", "legal"] },
    },
  ]),
  "/__preview/{lang}/works/{slug}/{number}": preview("Link preview of a photo", [
    lang,
    pathParam("slug", "Slug of the work, e.g. gavarnie"),
    {
      name: "number",
      in: "path",
      required: true,
      description: "Number of the photo in the work, from 1; out of range gives the first photo.",
      schema: { type: "integer", minimum: 1, example: 1 },
    },
  ]),
  "/__exists/{lang}/works/{slug}": {
    get: {
      tags: [tag.name],
      summary: "Whether the page of a work exists",
      description: [
        "Asked by the site's nginx (auth_request) before serving the page of a work, so that",
        "an unknown work gets a 404 status. auth_request only understands 2xx and 401/403,",
        "hence 403 for a missing work, which nginx turns into a 404.",
      ].join(" "),
      parameters: [lang, pathParam("slug", "Slug of the work, e.g. gavarnie")],
      responses: {
        204: { description: "The work exists" },
        403: { description: "No such work" },
        500: response("ServerError"),
      },
    },
  },
};

module.exports = { tag, schemas: {}, paths };
