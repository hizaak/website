// Error bodies and responses shared by every section.
const { ref, json } = require("./helpers");

const schemas = {
  Message: {
    type: "object",
    description: "Plain message, returned on success (deletions) and by most errors.",
    properties: {
      message: { type: "string", example: "Work deleted." },
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
        example: ['"title" is required'],
      },
    },
  },
  ServerError: {
    type: "object",
    description: "Returned with 500.",
    properties: {
      message: { type: "string", example: "Server error." },
      error: { type: "string" },
    },
  },
};

const responses = {
  Unauthorized: json(ref("Message"), "Token missing, invalid or expired"),
  ValidationError: json(ref("ValidationError"), "Invalid request body"),
  TooManyAttempts: json(
    ref("Message"),
    "More than 10 failed attempts from this IP in 15 minutes (shared by /login and /account)"
  ),
  WorkNotFound: json(ref("Message"), "Work not found"),
  PhotoNotFound: json(ref("Message"), "Photo not found"),
  DocumentNotFound: json(ref("DocumentError"), "Document not found (code DOCUMENT_NOT_FOUND)"),
  ServerError: json(ref("ServerError"), "Server error"),
};

module.exports = { schemas, responses };
