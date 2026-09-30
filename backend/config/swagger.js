const swaggerJsdoc = require("swagger-jsdoc");
const { ADMIN_PASSWORD_MIN_LENGTH } = require("./validation");

// Shorthands for the spec below.
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const response = (name) => ({ $ref: `#/components/responses/${name}` });
const json = (schema, description = "OK") => ({
  description,
  content: { "application/json": { schema } },
});
const jsonBody = (schema) => ({
  required: true,
  content: { "application/json": { schema } },
});
const multipartBody = (schema, required = true) => ({
  required,
  content: { "multipart/form-data": { schema } },
});
const pathParam = (name, description) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string" },
});
const secured = [{ bearerAuth: [] }];

const objectId = { type: "string", example: "665a1b2c3d4e5f6789012345" };

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
    tags: [
      { name: "Authentication", description: "Admin login and account" },
      { name: "Works", description: "Series of photos" },
      { name: "Photos", description: "Photos of a work" },
      { name: "Pages", description: "Data shaped for the public pages" },
      { name: "Documents", description: "Raw files published under /documents" },
      { name: "Files", description: "Uploaded images" },
      { name: "SEO", description: "Sitemap and link previews" },
      { name: "Misc" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token returned by POST /login, valid for 1 hour.",
        },
      },
      responses: {
        Unauthorized: json(ref("Message"), "Token missing, invalid or expired"),
        ValidationError: json(ref("ValidationError"), "Invalid request body"),
        TooManyAttempts: json(
          ref("Message"),
          "More than 10 failed attempts from this IP in 15 minutes (shared by /login and /account)"
        ),
        WorkNotFound: json(ref("Message"), "Work not found"),
        PhotoNotFound: json(ref("Message"), "Photo not found"),
        DocumentNotFound: json(ref("DocumentError"), "Document not found (code DOCUMENT_NOT_FOUND)"),
        ServerError: json(ref("ServerError"), "Server error"),
      },
      schemas: {
        Message: {
          type: "object",
          properties: {
            message: { type: "string", example: "Work deleted." },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation failed." },
            errors: {
              type: "array",
              items: { type: "string" },
              example: ['"title" is required'],
            },
          },
        },
        ServerError: {
          type: "object",
          properties: {
            message: { type: "string", example: "Server error." },
            error: { type: "string" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: {
              type: "string",
              pattern: "^[a-zA-Z0-9]{3,30}$",
              description: "Letters and digits, 3 to 30 characters.",
            },
            password: { type: "string", format: "password", minLength: 3 },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Login successful." },
            token: { type: "string", description: "JWT, valid for 1 hour." },
          },
        },
        Account: {
          type: "object",
          properties: {
            username: { type: "string", example: "alexandre" },
          },
        },
        AccountUpdate: {
          type: "object",
          required: ["currentPassword"],
          description: "At least one of newUsername and newPassword.",
          properties: {
            currentPassword: { type: "string", format: "password" },
            newUsername: {
              type: "string",
              pattern: "^[a-zA-Z0-9]{3,30}$",
              description: "Letters and digits, 3 to 30 characters.",
            },
            newPassword: {
              type: "string",
              format: "password",
              minLength: ADMIN_PASSWORD_MIN_LENGTH,
              maxLength: 200,
            },
          },
        },

        Work: {
          type: "object",
          properties: {
            _id: objectId,
            title: { type: "string", example: "Gavarnie" },
            slug: { type: "string", example: "gavarnie" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        WorkWithYears: {
          allOf: [
            ref("Work"),
            {
              type: "object",
              properties: {
                yearRange: {
                  type: "string",
                  example: "2021-2023",
                  description: "Years of its photos; empty when it has none.",
                },
              },
            },
          ],
        },
        WorkCreate: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              example: "Gavarnie",
              description: "Must be unique; the slug is derived from it.",
            },
          },
        },
        WorkUpdate: {
          type: "object",
          properties: {
            title: { type: "string", minLength: 1, maxLength: 255, example: "Pays basque" },
          },
        },

        Photo: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6789012346" },
            workId: objectId,
            title: { type: "string", example: "Cirque au matin" },
            photoDate: { type: "string", example: "14/08/2023" },
            filename: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000.jpg",
              description: "Served at /uploads/{filename}.",
            },
            thumbnailFilename: {
              type: "string",
              example: "550e8400-e29b-41d4-a716-446655440000.jpg",
              description: "Served at /uploads/thumbnails/{filename}.",
            },
            originalFilename: { type: "string", example: "IMG_1234.jpg" },
            mimeType: { type: "string", enum: ["image/jpeg", "image/png"] },
            position: { type: "integer", example: 0, description: "Order in the work, from 0." },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PhotoCreate: {
          type: "object",
          required: ["title", "photoDate", "photo"],
          properties: {
            title: { type: "string", minLength: 1, maxLength: 255, example: "Cirque au matin" },
            photoDate: {
              type: "string",
              pattern: "^\\d{2}/\\d{2}/\\d{4}$",
              example: "14/08/2023",
              description: "DD/MM/YYYY.",
            },
            photo: {
              type: "string",
              format: "binary",
              description:
                "PNG or JPEG, 10 MB max. Re-encoded (metadata and GPS removed, 3840 px and 3 MB max) with a 300 px thumbnail.",
            },
          },
        },
        PhotoUpdate: {
          type: "object",
          description: "Every field is optional.",
          properties: {
            title: { type: "string", minLength: 1, maxLength: 255 },
            photoDate: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", example: "03/11/2024" },
            photo: {
              type: "string",
              format: "binary",
              description: "Replaces the image (same rules as on creation).",
            },
          },
        },
        PhotoReorder: {
          type: "object",
          required: ["photoIds"],
          properties: {
            photoIds: {
              type: "array",
              description: "Every photo id of the work, once each, in the new order.",
              items: { type: "string", pattern: "^[0-9a-f]{24}$" },
              uniqueItems: true,
              minItems: 1,
              example: ["665a1b2c3d4e5f6789012346", "665a1b2c3d4e5f6789012347"],
            },
          },
        },

        WorkListItem: {
          type: "object",
          properties: {
            _id: objectId,
            title: { type: "string", example: "Gavarnie" },
            slug: { type: "string", example: "gavarnie" },
            yearRange: { type: "string", example: "2020" },
          },
        },
        WorkPage: {
          type: "object",
          properties: {
            _id: objectId,
            title: { type: "string", example: "Gavarnie" },
            slug: { type: "string", example: "gavarnie" },
            photos: {
              type: "array",
              description: "In display order.",
              items: {
                type: "object",
                properties: {
                  _id: { type: "string", example: "665a1b2c3d4e5f6789012346" },
                  title: { type: "string", example: "Cirque au matin" },
                  photoDate: { type: "string", example: "14/08/2023" },
                  filename: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000.jpg" },
                },
              },
            },
          },
        },

        Document: {
          type: "object",
          properties: {
            filename: { type: "string", example: "cv.pdf" },
            slug: { type: "string", example: "cv", description: "Public URL: /documents/{slug}." },
            extension: { type: "string", example: ".pdf" },
            size: { type: "integer", example: 104857, description: "In bytes." },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        DocumentCreate: {
          type: "object",
          required: ["document"],
          properties: {
            document: { type: "string", format: "binary", description: "Any file, 50 MB max." },
            name: {
              type: "string",
              maxLength: 120,
              example: "cv",
              description:
                "Lowercase letters, digits, - and _. The extension may be omitted but not changed. Defaults to the original file name.",
            },
            replace: {
              type: "boolean",
              default: false,
              description: "Replace the document already published under the same slug.",
            },
          },
        },
        DocumentRename: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 120, example: "cv-2026" },
          },
        },
        DocumentError: {
          type: "object",
          properties: {
            message: { type: "string" },
            code: {
              type: "string",
              enum: [
                "DOCUMENT_FILE_MISSING",
                "DOCUMENT_TOO_LARGE",
                "DOCUMENT_NAME_INVALID",
                "DOCUMENT_EXTENSION_INVALID",
                "DOCUMENT_EXTENSION_MISMATCH",
                "DOCUMENT_NAME_TAKEN",
                "DOCUMENT_NOT_FOUND",
              ],
            },
          },
        },
      },
    },
    paths: {
      "/login": {
        post: {
          tags: ["Authentication"],
          summary: "Log in",
          description: "Returns a JWT valid for 1 hour.",
          requestBody: jsonBody(ref("LoginRequest")),
          responses: {
            200: json(ref("LoginResponse"), "Logged in"),
            400: response("ValidationError"),
            401: json(ref("Message"), "Invalid credentials"),
            429: response("TooManyAttempts"),
            500: response("ServerError"),
          },
        },
      },
      "/account": {
        get: {
          tags: ["Authentication"],
          summary: "Get the logged-in account",
          security: secured,
          responses: {
            200: json(ref("Account")),
            401: response("Unauthorized"),
            500: response("ServerError"),
          },
        },
        put: {
          tags: ["Authentication"],
          summary: "Change the username and/or password",
          security: secured,
          requestBody: jsonBody(ref("AccountUpdate")),
          responses: {
            200: json(ref("Account"), "Account updated"),
            400: response("ValidationError"),
            401: response("Unauthorized"),
            403: json(ref("Message"), "Current password is incorrect"),
            409: json(ref("Message"), "Username already taken"),
            429: response("TooManyAttempts"),
            500: response("ServerError"),
          },
        },
      },

      "/api/works": {
        get: {
          tags: ["Works"],
          summary: "List the works",
          description: "Sorted by title.",
          responses: {
            200: json({ type: "array", items: ref("WorkWithYears") }),
            500: response("ServerError"),
          },
        },
        post: {
          tags: ["Works"],
          summary: "Create a work",
          security: secured,
          requestBody: jsonBody(ref("WorkCreate")),
          responses: {
            201: json(ref("Work"), "Work created"),
            400: response("ValidationError"),
            401: response("Unauthorized"),
            409: json(ref("Message"), "Title or slug already used"),
            500: response("ServerError"),
          },
        },
      },
      "/api/works/{id}": {
        get: {
          tags: ["Works"],
          summary: "Get a work",
          parameters: [pathParam("id", "Id or slug of the work")],
          responses: {
            200: json(ref("Work")),
            404: response("WorkNotFound"),
            500: response("ServerError"),
          },
        },
        put: {
          tags: ["Works"],
          summary: "Rename a work",
          description: "The slug follows the new title.",
          security: secured,
          parameters: [pathParam("id", "Id of the work")],
          requestBody: jsonBody(ref("WorkUpdate")),
          responses: {
            200: json(ref("Work"), "Work updated"),
            400: response("ValidationError"),
            401: response("Unauthorized"),
            404: response("WorkNotFound"),
            409: json(ref("Message"), "Title or slug already used"),
            500: response("ServerError"),
          },
        },
        delete: {
          tags: ["Works"],
          summary: "Delete a work and all its photos",
          security: secured,
          parameters: [pathParam("id", "Id of the work")],
          responses: {
            200: json(ref("Message"), "Work deleted"),
            401: response("Unauthorized"),
            404: response("WorkNotFound"),
            500: response("ServerError"),
          },
        },
      },

      "/api/works/{workId}/photos": {
        get: {
          tags: ["Photos"],
          summary: "List the photos of a work",
          description: "In display order.",
          parameters: [pathParam("workId", "Id of the work")],
          responses: {
            200: json({ type: "array", items: ref("Photo") }),
            404: response("WorkNotFound"),
            500: response("ServerError"),
          },
        },
        post: {
          tags: ["Photos"],
          summary: "Add a photo to a work",
          description: "Added at the end of the work.",
          security: secured,
          parameters: [pathParam("workId", "Id of the work")],
          requestBody: multipartBody(ref("PhotoCreate")),
          responses: {
            201: json(ref("Photo"), "Photo created"),
            400: json(
              { oneOf: [ref("ValidationError"), ref("Message")] },
              "Invalid fields, image missing, unsupported format or unreadable image"
            ),
            401: response("Unauthorized"),
            404: response("WorkNotFound"),
            500: response("ServerError"),
          },
        },
      },
      "/api/works/{workId}/photos/reorder": {
        put: {
          tags: ["Photos"],
          summary: "Reorder the photos of a work",
          security: secured,
          parameters: [pathParam("workId", "Id of the work")],
          requestBody: jsonBody(ref("PhotoReorder")),
          responses: {
            200: json({ type: "array", items: ref("Photo") }, "Photos in their new order"),
            400: json(
              { oneOf: [ref("ValidationError"), ref("Message")] },
              "Invalid body, or the list does not match the photos of this work"
            ),
            401: response("Unauthorized"),
            404: response("WorkNotFound"),
            500: response("ServerError"),
          },
        },
      },
      "/api/photos/{id}": {
        get: {
          tags: ["Photos"],
          summary: "Get a photo",
          parameters: [pathParam("id", "Id of the photo")],
          responses: {
            200: json(ref("Photo")),
            404: response("PhotoNotFound"),
            500: response("ServerError"),
          },
        },
        put: {
          tags: ["Photos"],
          summary: "Update a photo",
          security: secured,
          parameters: [pathParam("id", "Id of the photo")],
          requestBody: multipartBody(ref("PhotoUpdate"), false),
          responses: {
            200: json(ref("Photo"), "Photo updated"),
            400: json(
              { oneOf: [ref("ValidationError"), ref("Message")] },
              "Invalid fields, unsupported format or unreadable image"
            ),
            401: response("Unauthorized"),
            404: response("PhotoNotFound"),
            500: response("ServerError"),
          },
        },
        delete: {
          tags: ["Photos"],
          summary: "Delete a photo",
          description: "Its image and thumbnail are deleted too.",
          security: secured,
          parameters: [pathParam("id", "Id of the photo")],
          responses: {
            200: json(ref("Message"), "Photo deleted"),
            401: response("Unauthorized"),
            404: response("PhotoNotFound"),
            500: response("ServerError"),
          },
        },
      },

      "/api/pages/works": {
        get: {
          tags: ["Pages"],
          summary: "Data of the works page",
          description: "Sorted by title.",
          responses: {
            200: json({ type: "array", items: ref("WorkListItem") }),
            500: response("ServerError"),
          },
        },
      },
      "/api/pages/work/{id}": {
        get: {
          tags: ["Pages"],
          summary: "Data of a work page",
          parameters: [pathParam("id", "Id or slug of the work")],
          responses: {
            200: json(ref("WorkPage")),
            404: response("WorkNotFound"),
            500: response("ServerError"),
          },
        },
      },

      "/api/documents": {
        get: {
          tags: ["Documents"],
          summary: "List the documents",
          security: secured,
          responses: {
            200: json({ type: "array", items: ref("Document") }),
            401: response("Unauthorized"),
            500: response("ServerError"),
          },
        },
        post: {
          tags: ["Documents"],
          summary: "Upload a document",
          security: secured,
          requestBody: multipartBody(ref("DocumentCreate")),
          responses: {
            201: json(ref("Document"), "Document published"),
            400: json(ref("DocumentError"), "File missing or invalid name"),
            401: response("Unauthorized"),
            409: json(ref("DocumentError"), "A document is already published under this slug (code DOCUMENT_NAME_TAKEN)"),
            413: json(ref("DocumentError"), "File larger than 50 MB (code DOCUMENT_TOO_LARGE)"),
            500: response("ServerError"),
          },
        },
      },
      "/api/documents/{filename}": {
        put: {
          tags: ["Documents"],
          summary: "Rename a document",
          security: secured,
          parameters: [pathParam("filename", "Current file name, e.g. cv.pdf")],
          requestBody: jsonBody(ref("DocumentRename")),
          responses: {
            200: json(ref("Document"), "Document renamed"),
            400: json(ref("DocumentError"), "Invalid name"),
            401: response("Unauthorized"),
            404: response("DocumentNotFound"),
            409: json(ref("DocumentError"), "A document is already published under this slug (code DOCUMENT_NAME_TAKEN)"),
            500: response("ServerError"),
          },
        },
        delete: {
          tags: ["Documents"],
          summary: "Delete a document",
          security: secured,
          parameters: [pathParam("filename", "File name, e.g. cv.pdf")],
          responses: {
            200: json(ref("Message"), "Document deleted"),
            401: response("Unauthorized"),
            404: response("DocumentNotFound"),
            500: response("ServerError"),
          },
        },
      },
      "/documents/{name}": {
        get: {
          tags: ["Documents"],
          summary: "Download a document",
          description: [
            "Public URL of a document, also served at https://alexandremaurice.fr/documents/{name}.",
            "Every document except `cv` is sent with `X-Robots-Tag: noindex`;",
            "everything except PDFs is sandboxed (`Content-Security-Policy: sandbox`).",
          ].join(" "),
          parameters: [pathParam("name", "Slug (cv) or full file name (cv.pdf)")],
          responses: {
            200: {
              description: "The file",
              content: { "application/octet-stream": { schema: { type: "string", format: "binary" } } },
            },
            404: {
              description: "Document not found",
              content: { "text/plain": { schema: { type: "string", example: "Document not found." } } },
            },
          },
        },
      },

      "/uploads/{filename}": {
        get: {
          tags: ["Files"],
          summary: "Full-size image of a photo",
          description: "Cached for a year: a new image always gets a new name.",
          parameters: [pathParam("filename", "Photo.filename")],
          responses: {
            200: {
              description: "The image",
              content: {
                "image/jpeg": { schema: { type: "string", format: "binary" } },
                "image/png": { schema: { type: "string", format: "binary" } },
              },
            },
            404: json(ref("Message"), "No such file"),
          },
        },
      },
      "/uploads/thumbnails/{filename}": {
        get: {
          tags: ["Files"],
          summary: "300 px thumbnail of a photo",
          parameters: [pathParam("filename", "Photo.thumbnailFilename")],
          responses: {
            200: {
              description: "The thumbnail",
              content: {
                "image/jpeg": { schema: { type: "string", format: "binary" } },
                "image/png": { schema: { type: "string", format: "binary" } },
              },
            },
            404: json(ref("Message"), "No such file"),
          },
        },
      },

      "/sitemap.xml": {
        get: {
          tags: ["SEO"],
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
          tags: ["SEO"],
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

      "/": {
        get: {
          tags: ["Misc"],
          summary: "Check that the API is up",
          responses: {
            200: json(ref("Message")),
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

// Swagger UI settings: keep the token across reloads, and fill it in as soon
// as POST /login succeeds.
const uiOptions = {
  customSiteTitle: "alexandre maurice — API",
  swaggerOptions: {
    persistAuthorization: true,
    responseInterceptor: function (response) {
      if (response.ok && /\/login$/.test(response.url) && response.body && response.body.token) {
        window.ui.preauthorizeApi("bearerAuth", response.body.token);
      }
      return response;
    },
  },
};

module.exports = { specs, uiOptions };
