const {
  ref,
  response,
  json,
  message,
  jsonBody,
  multipartBody,
  pathParam,
  secured,
  objectId,
} = require("./helpers");

const tag = { name: "Photos", description: "Photos of a work" };

const photoDate = {
  type: "string",
  format: "date",
  description: "Day the photo was taken, YYYY-MM-DD.",
};

// 400 of the routes taking an image: Joi fields, or a message and a code
// from the upload (unsupported format, unreadable image).
const uploadErrors = {
  fields: {
    summary: "Invalid fields",
    value: {
      message: "Validation failed.",
      errors: ["photoDate must be in YYYY-MM-DD format."],
    },
  },
  format: {
    summary: "Not a PNG or JPEG",
    value: {
      message: "Unsupported format. Only PNG and JPEG are accepted.",
      code: "IMAGE_FORMAT_UNSUPPORTED",
    },
  },
  unreadable: {
    summary: "Unreadable image",
    value: { message: "Unable to process image.", code: "IMAGE_UNREADABLE" },
  },
};

const tooLarge = {
  description: "Image over 10 MB",
  content: {
    "application/json": {
      schema: ref("Message"),
      example: { message: "File too large.", code: "IMAGE_TOO_LARGE" },
    },
  },
};

const invalidPhoto = (description, examples) => ({
  description,
  content: {
    "application/json": {
      schema: { oneOf: [ref("ValidationError"), ref("Message")] },
      examples,
    },
  },
});

const schemas = {
  PhotoSize: {
    type: "object",
    properties: {
      size: { type: "integer", example: 1280, description: "Long-edge box the version fits in." },
      width: { type: "integer", example: 1280 },
      height: { type: "integer", example: 853 },
    },
  },
  Photo: {
    type: "object",
    description: "A photo of a work.",
    properties: {
      _id: { type: "string", example: "665a1b2c3d4e5f6789012346" },
      workId: objectId,
      title: { type: "string", example: "Cirque au matin" },
      photoDate: { type: "string", format: "date-time", example: "2023-08-14T00:00:00.000Z", description: "Midnight UTC of the day the photo was taken." },
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
      width: { type: "integer", example: 3840, description: "Of the stored original, in pixels." },
      height: { type: "integer", example: 2560 },
      sizes: {
        type: "array",
        description: "Smaller versions, served at /uploads/sizes/{size}/{filename}. Only those under the original's long edge exist.",
        items: { $ref: "#/components/schemas/PhotoSize" },
      },
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
      photoDate: { ...photoDate, example: "2023-08-14" },
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
      title: { type: "string", minLength: 1, maxLength: 255, example: "Cirque au soir" },
      photoDate: { ...photoDate, example: "2024-11-03" },
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
        description:
          "Ids of photos of this work, once each, in the new order. Send all of them: photos left out keep their old position.",
        items: { type: "string", pattern: "^[0-9a-fA-F]{24}$" },
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
        400: invalidPhoto("Invalid fields, image missing, unsupported or unreadable", {
          missing: { summary: "No image", value: { message: "Image file is missing." } },
          ...uploadErrors,
        }),
        401: response("Unauthorized"),
        404: response("WorkNotFound"),
        413: tooLarge,
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
        400: invalidPhoto("Invalid body, or an id is not a photo of this work", {
          fields: {
            summary: "Invalid body",
            value: { message: "Validation failed.", errors: ['"photoIds" is required'] },
          },
          mismatch: {
            summary: "Id from another work",
            value: { message: "The photo list does not match this work." },
          },
        }),
        401: response("Unauthorized"),
        404: response("WorkNotFound"),
        413: tooLarge,
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
        400: invalidPhoto("Invalid fields, image unsupported or unreadable", uploadErrors),
        401: response("Unauthorized"),
        404: response("PhotoNotFound"),
        413: tooLarge,
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
        200: message("Photo deleted", "Photo deleted."),
        401: response("Unauthorized"),
        404: response("PhotoNotFound"),
        500: response("ServerError"),
      },
    },
  },
};

module.exports = { tag, schemas, paths };
