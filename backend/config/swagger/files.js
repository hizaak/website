const { message, pathParam, binary } = require("./helpers");

const tag = { name: "Files", description: "Uploaded images" };

const paths = {
  "/uploads/{filename}": {
    get: {
      tags: [tag.name],
      summary: "Full-size image of a photo",
      description: "Cached for a year: a new image always gets a new name.",
      parameters: [pathParam("filename", "Photo.filename")],
      responses: {
        200: { description: "The image", content: binary("image/jpeg", "image/png") },
        404: message("No such file", "Endpoint not found"),
      },
    },
  },
  "/uploads/thumbnails/{filename}": {
    get: {
      tags: [tag.name],
      summary: "300 px thumbnail of a photo",
      parameters: [pathParam("filename", "Photo.thumbnailFilename")],
      responses: {
        200: { description: "The thumbnail", content: binary("image/jpeg", "image/png") },
        404: message("No such file", "Endpoint not found"),
      },
    },
  },
};

module.exports = { tag, schemas: {}, paths };
