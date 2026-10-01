// Shorthands shared by the OpenAPI sections.

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const response = (name) => ({ $ref: `#/components/responses/${name}` });

const json = (schema, description = "OK", example) => ({
  description,
  content: { "application/json": { schema, ...(example && { example }) } },
});

// Response with a plain { message } body, showing the message actually sent.
const message = (description, text) =>
  json(ref("Message"), description, { message: text });

// 400 from validateRequest, with the Joi messages this route can produce.
const validationError = (...errors) =>
  json(ref("ValidationError"), "Invalid request body", {
    message: "Validation failed.",
    errors,
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
  message,
  validationError,
  jsonBody,
  multipartBody,
  pathParam,
  binary,
  secured,
  objectId,
};
