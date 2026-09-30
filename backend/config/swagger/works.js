const { ref, response, json, jsonBody, pathParam, secured, objectId } = require("./helpers");

const tag = { name: "Works", description: "Series of photos" };

const schemas = {
  Work: {
    type: "object",
    description: "A series of photos.",
    properties: {
      _id: objectId,
      title: { type: "string", example: "Gavarnie" },
      slug: { type: "string", example: "gavarnie" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  WorkWithYears: {
    description: "A work, with the years of its photos (GET /api/works).",
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
    description: "Body of POST /api/works.",
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
    description: "Body of PUT /api/works/{id}.",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 255, example: "Pays basque" },
    },
  },
};

const paths = {
  "/api/works": {
    get: {
      tags: [tag.name],
      summary: "List the works",
      description: "Sorted by title.",
      responses: {
        200: json({ type: "array", items: ref("WorkWithYears") }),
        500: response("ServerError"),
      },
    },
    post: {
      tags: [tag.name],
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
      tags: [tag.name],
      summary: "Get a work",
      parameters: [pathParam("id", "Id or slug of the work")],
      responses: {
        200: json(ref("Work")),
        404: response("WorkNotFound"),
        500: response("ServerError"),
      },
    },
    put: {
      tags: [tag.name],
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
      tags: [tag.name],
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
};

module.exports = { tag, schemas, paths };
