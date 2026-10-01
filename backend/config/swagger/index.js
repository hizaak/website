// OpenAPI spec served at /api-docs. Each section (auth.js, works.js...) holds
// the schemas and routes of one tag; the order below is the order in the UI.
const swaggerJsdoc = require("swagger-jsdoc");
const common = require("./common");
const { message } = require("./helpers");

const misc = {
  tag: { name: "Misc" },
  schemas: {},
  paths: {
    "/": {
      get: {
        tags: ["Misc"],
        summary: "Check that the API is up",
        responses: {
          200: message("OK", "Portfolio API - See /api-docs for documentation"),
        },
      },
    },
  },
};

const sections = [
  require("./auth"),
  require("./works"),
  require("./photos"),
  require("./pages"),
  require("./documents"),
  require("./files"),
  require("./seo"),
  misc,
];

const merge = (key) => Object.assign({}, ...sections.map((section) => section[key]));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "alexandre maurice — API",
      version: "3.0.0",
      description: [
        "API of alexandremaurice.fr: works, photos, documents, admin account and SEO.",
        "",
        "**Authentication**: routes marked with a lock need a JWT.",
        "Call `POST /login` below: on success the token is filled in automatically",
        "(or click **Authorize** and paste it). It stays valid for 1 hour.",
      ].join("\n"),
      contact: {
        name: "Alexandre Maurice",
        email: "contact@alexandremaurice.fr",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? process.env.PROD_URL
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    tags: sections.map((section) => section.tag),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token returned by POST /login, valid for 1 hour.",
        },
      },
      responses: common.responses,
      // Section schemas first, in UI order; the shared error bodies last.
      schemas: { ...merge("schemas"), ...common.schemas },
    },
    paths: merge("paths"),
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

// Swagger UI settings: keep the token across reloads, fill it in as soon as
// POST /login succeeds, and keep the schemas list folded.
const uiOptions = {
  customSiteTitle: "alexandre maurice — API",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "list",
    defaultModelsExpandDepth: 0,
    responseInterceptor: function (response) {
      if (response.ok && /\/login$/.test(response.url) && response.body && response.body.token) {
        window.ui.preauthorizeApi("bearerAuth", response.body.token);
      }
      return response;
    },
  },
};

module.exports = { specs, uiOptions };
