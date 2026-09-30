const {
  ref,
  response,
  json,
  jsonBody,
  multipartBody,
  pathParam,
  binary,
  secured,
} = require("./helpers");

const tag = { name: "Documents", description: "Raw files published under /documents" };

const nameTaken = json(
  ref("DocumentError"),
  "A document is already published under this slug (code DOCUMENT_NAME_TAKEN)"
);

const schemas = {
  Document: {
    type: "object",
    description: "A published document.",
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
    description: "Body of POST /api/documents.",
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
    description: "Body of PUT /api/documents/{filename}.",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 120, example: "cv-2026" },
    },
  },
  DocumentError: {
    type: "object",
    description: "Error of the document routes, with a code the admin translates.",
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
};

const paths = {
  "/api/documents": {
    get: {
      tags: [tag.name],
      summary: "List the documents",
      security: secured,
      responses: {
        200: json({ type: "array", items: ref("Document") }),
        401: response("Unauthorized"),
        500: response("ServerError"),
      },
    },
    post: {
      tags: [tag.name],
      summary: "Upload a document",
      security: secured,
      requestBody: multipartBody(ref("DocumentCreate")),
      responses: {
        201: json(ref("Document"), "Document published"),
        400: json(ref("DocumentError"), "File missing or invalid name"),
        401: response("Unauthorized"),
        409: nameTaken,
        413: json(ref("DocumentError"), "File larger than 50 MB (code DOCUMENT_TOO_LARGE)"),
        500: response("ServerError"),
      },
    },
  },
  "/api/documents/{filename}": {
    put: {
      tags: [tag.name],
      summary: "Rename a document",
      security: secured,
      parameters: [pathParam("filename", "Current file name, e.g. cv.pdf")],
      requestBody: jsonBody(ref("DocumentRename")),
      responses: {
        200: json(ref("Document"), "Document renamed"),
        400: json(ref("DocumentError"), "Invalid name"),
        401: response("Unauthorized"),
        404: response("DocumentNotFound"),
        409: nameTaken,
        500: response("ServerError"),
      },
    },
    delete: {
      tags: [tag.name],
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
      tags: [tag.name],
      summary: "Download a document",
      description: [
        "Public URL of a document, also served at https://alexandremaurice.fr/documents/{name}.",
        "Every document except `cv` is sent with `X-Robots-Tag: noindex`;",
        "everything except PDFs is sandboxed (`Content-Security-Policy: sandbox`).",
      ].join(" "),
      parameters: [pathParam("name", "Slug (cv) or full file name (cv.pdf)")],
      responses: {
        200: { description: "The file", content: binary("application/octet-stream") },
        404: {
          description: "Document not found",
          content: { "text/plain": { schema: { type: "string", example: "Document not found." } } },
        },
      },
    },
  },
};

module.exports = { tag, schemas, paths };
