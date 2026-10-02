const { ref, response, json, pathParam, objectId } = require("./helpers");

const tag = { name: "Pages", description: "Data shaped for the public pages" };

const schemas = {
  PagePhoto: {
    type: "object",
    description: "A photo as shown on the public pages.",
    properties: {
      _id: objectId,
      title: { type: "string", example: "Cirque au matin" },
      photoDate: { type: "string", format: "date-time", example: "2023-08-14T00:00:00.000Z" },
      filename: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000.jpg" },
      width: { type: "integer", example: 3840 },
      height: { type: "integer", example: 2560 },
      sizes: { type: "array", items: { $ref: "#/components/schemas/PhotoSize" } },
    },
  },
  WorkListItem: {
    type: "object",
    description: "A work on the works page.",
    properties: {
      _id: objectId,
      title: { type: "string", example: "Gavarnie" },
      slug: { type: "string", example: "gavarnie" },
      yearRange: { type: "string", example: "2020" },
    },
  },
  WorkPage: {
    type: "object",
    description: "A work with its photos, for its own page.",
    properties: {
      _id: objectId,
      title: { type: "string", example: "Gavarnie" },
      slug: { type: "string", example: "gavarnie" },
      photos: {
        type: "array",
        description: "In display order.",
        items: ref("PagePhoto"),
      },
    },
  },
};

const paths = {
  "/api/pages/home": {
    get: {
      tags: [tag.name],
      summary: "Data of the home page",
      description: "A photo drawn at random at every call, or null when the site has none.",
      parameters: [
        {
          name: "not",
          in: "query",
          required: false,
          description: "Id of the photo already shown, left out unless it is the only one",
          schema: { type: "string" },
        },
      ],
      responses: {
        200: json({ allOf: [ref("PagePhoto")], nullable: true }),
        500: response("ServerError"),
      },
    },
  },
  "/api/pages/works": {
    get: {
      tags: [tag.name],
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
      tags: [tag.name],
      summary: "Data of a work page",
      parameters: [pathParam("id", "Id or slug of the work")],
      responses: {
        200: json(ref("WorkPage")),
        404: response("WorkNotFound"),
        500: response("ServerError"),
      },
    },
  },
};

module.exports = { tag, schemas, paths };
