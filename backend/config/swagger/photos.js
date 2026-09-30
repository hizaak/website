const {
  ref,
  response,
  json,
  jsonBody,
  multipartBody,
  pathParam,
  secured,
  objectId,
} = require("./helpers");

const tag = { name: "Photos", description: "Photos of a work" };

const photoDate = {
  type: "string",
  pattern: "^\\d{2}/\\d{2}/\\d{4}$",
  description: "DD/MM/YYYY.",
};

// 400 of the routes taking an image: Joi fields, or a plain message from the
// upload (image missing, unsupported format, unreadable image).
const invalidPhoto = (description) =>
  json({ oneOf: [ref("ValidationError"), ref("Message")] }, description);

const schemas = {
  Photo: {
    type: "object",
    description: "A photo of a work.",
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
    description: "Body of POST /api/works/{workId}/photos.",
    required: ["title", "photoDate", "photo"],
    properties: {
      title: { type: "string", minLength: 1, maxLength: 255, example: "Cirque au matin" },
      photoDate: { ...photoDate, example: "14/08/2023" },
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
    description: "Body of PUT /api/photos/{id}. Every field is optional.",
    properties: {
      title: { type: "string", minLength: 1, maxLength: 255 },
      photoDate: { ...photoDate, example: "03/11/2024" },
      photo: {
        type: "string",
        format: "binary",
        description: "Replaces the image (same rules as on creation).",
      },
    },
  },
  PhotoReorder: {
    type: "object",
    description: "Body of PUT /api/works/{workId}/photos/reorder.",
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
};

const paths = {
  "/api/works/{workId}/photos": {
    get: {
      tags: [tag.name],
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
      tags: [tag.name],
      summary: "Add a photo to a work",
      description: "Added at the end of the work.",
      security: secured,
      parameters: [pathParam("workId", "Id of the work")],
      requestBody: multipartBody(ref("PhotoCreate")),
      responses: {
        201: json(ref("Photo"), "Photo created"),
        400: invalidPhoto("Invalid fields, image missing, unsupported format or unreadable image"),
        401: response("Unauthorized"),
        404: response("WorkNotFound"),
        500: response("ServerError"),
      },
    },
  },
  "/api/works/{workId}/photos/reorder": {
    put: {
      tags: [tag.name],
      summary: "Reorder the photos of a work",
      security: secured,
      parameters: [pathParam("workId", "Id of the work")],
      requestBody: jsonBody(ref("PhotoReorder")),
      responses: {
        200: json({ type: "array", items: ref("Photo") }, "Photos in their new order"),
        400: invalidPhoto("Invalid body, or the list does not match the photos of this work"),
        401: response("Unauthorized"),
        404: response("WorkNotFound"),
        500: response("ServerError"),
      },
    },
  },
  "/api/photos/{id}": {
    get: {
      tags: [tag.name],
      summary: "Get a photo",
      parameters: [pathParam("id", "Id of the photo")],
      responses: {
        200: json(ref("Photo")),
        404: response("PhotoNotFound"),
        500: response("ServerError"),
      },
    },
    put: {
      tags: [tag.name],
      summary: "Update a photo",
      security: secured,
      parameters: [pathParam("id", "Id of the photo")],
      requestBody: multipartBody(ref("PhotoUpdate"), false),
      responses: {
        200: json(ref("Photo"), "Photo updated"),
        400: invalidPhoto("Invalid fields, unsupported format or unreadable image"),
        401: response("Unauthorized"),
        404: response("PhotoNotFound"),
        500: response("ServerError"),
      },
    },
    delete: {
      tags: [tag.name],
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
};

module.exports = { tag, schemas, paths };
