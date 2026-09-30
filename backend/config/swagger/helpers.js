// Shorthands shared by the OpenAPI sections.

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

const binary = (...mimeTypes) =>
  Object.fromEntries(
    mimeTypes.map((type) => [type, { schema: { type: "string", format: "binary" } }])
  );

const secured = [{ bearerAuth: [] }];

const objectId = { type: "string", example: "665a1b2c3d4e5f6789012345" };

module.exports = {
  ref,
  response,
  json,
  jsonBody,
  multipartBody,
  pathParam,
  binary,
  secured,
  objectId,
};
