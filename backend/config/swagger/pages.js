const { ref, response, json, pathParam, objectId } = require("./helpers");

const tag = { name: "Pages", description: "Data shaped for the public pages" };

const schemas = {
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
};

const paths = {
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
