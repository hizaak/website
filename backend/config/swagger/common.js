// Error bodies and responses shared by every section.
const { ref, json, message } = require("./helpers");

const schemas = {
  Message: {
    type: "object",
    description: "Plain message, returned on success (deletions) and by most errors.",
    properties: {
      message: { type: "string" },
    },
  },
  ValidationError: {
    type: "object",
    description: "Returned with 400 when the body does not match the expected fields.",
    properties: {
      message: { type: "string", example: "Validation failed." },
      errors: {
        type: "array",
        items: { type: "string" },
        description: "One message per invalid field.",
      },
    },
  },
  ServerError: {
    type: "object",
    description: "Returned with 500.",
    properties: {
      message: { type: "string", example: "Server error." },
      error: { type: "string", description: "Underlying error message; not sent by every route." },
    },
  },
};

const responses = {
  Unauthorized: {
    description: "Token missing, invalid or expired",
    content: {
      "application/json": {
        schema: ref("Message"),
        examples: {
          missing: { summary: "No token", value: { message: "Token missing." } },
          invalid: {
            summary: "Invalid or expired token",
            value: { message: "Invalid or expired token." },
          },
        },
      },
    },
  },
  TooManyAttempts: message(
    "More than 10 failed requests (any 4xx) from this IP in 15 minutes, counted together for /login and /account",
    "Too many login attempts, try again later."
  ),
  WorkNotFound: message("Work not found", "Work not found."),
  PhotoNotFound: message("Photo not found", "Photo not found."),
  DocumentNotFound: json(ref("DocumentError"), "Document not found", {
    message: "Document not found.",
    code: "DOCUMENT_NOT_FOUND",
  }),
  ServerError: json(ref("ServerError"), "Server error"),
};

module.exports = { schemas, responses };
