const { ADMIN_PASSWORD_MIN_LENGTH } = require("../validation");
const { ref, response, json, message, validationError, jsonBody, secured } = require("./helpers");

const tag = { name: "Authentication", description: "Admin login and account" };

const username = {
  type: "string",
  pattern: "^[a-zA-Z0-9]{3,30}$",
  description: "Letters and digits, 3 to 30 characters.",
};

// The account may have been deleted while the token is still valid.
const accountGone = {
  description: "Token missing, invalid or expired, or the account no longer exists",
  content: {
    "application/json": {
      schema: ref("Message"),
      examples: {
        missing: { summary: "No token", value: { message: "Token missing." } },
        invalid: {
          summary: "Invalid or expired token",
          value: { message: "Invalid or expired token." },
        },
        deleted: { summary: "Account deleted", value: { message: "Invalid credentials." } },
      },
    },
  },
};

const schemas = {
  LoginRequest: {
    type: "object",
    description: "Body of POST /login.",
    required: ["username", "password"],
    properties: {
      username: { ...username, example: "alexandre" },
      password: { type: "string", format: "password", minLength: 3, example: "my password" },
    },
  },
  LoginResponse: {
    type: "object",
    description: "Returned by POST /login.",
    properties: {
      message: { type: "string", example: "Login successful." },
      token: { type: "string", description: "JWT, valid for 1 hour." },
    },
  },
  Account: {
    type: "object",
    description: "The logged-in admin account.",
    properties: {
      username: { type: "string", example: "alexandre" },
    },
  },
  AccountUpdate: {
    type: "object",
    description:
      "Body of PUT /account. At least one of newUsername and newPassword; a field left out keeps its current value.",
    required: ["currentPassword"],
    properties: {
      currentPassword: { type: "string", format: "password", example: "my password" },
      newUsername: { ...username, example: "alexandre" },
      newPassword: {
        type: "string",
        format: "password",
        minLength: ADMIN_PASSWORD_MIN_LENGTH,
        maxLength: 200,
        example: "a much longer password",
      },
    },
  },
};

const paths = {
  "/login": {
    post: {
      tags: [tag.name],
      summary: "Log in",
      description: "Returns a JWT valid for 1 hour.",
      requestBody: jsonBody(ref("LoginRequest")),
      responses: {
        200: json(ref("LoginResponse"), "Logged in"),
        400: validationError('"username" is required', '"password" is required'),
        401: message("Wrong username or password", "Invalid credentials."),
        429: response("TooManyAttempts"),
        500: response("ServerError"),
      },
    },
  },
  "/account": {
    get: {
      tags: [tag.name],
      summary: "Get the logged-in account",
      security: secured,
      responses: {
        200: json(ref("Account")),
        401: accountGone,
        500: response("ServerError"),
      },
    },
    put: {
      tags: [tag.name],
      summary: "Change the username and/or password",
      description:
        "Needs the current password. The token stays valid after the change.",
      security: secured,
      requestBody: jsonBody(ref("AccountUpdate")),
      responses: {
        200: json(ref("Account"), "Account updated"),
        400: validationError(
          '"value" must contain at least one of [newUsername, newPassword]',
          `"newPassword" length must be at least ${ADMIN_PASSWORD_MIN_LENGTH} characters long`
        ),
        401: accountGone,
        403: message("Current password is incorrect", "Current password is incorrect."),
        409: message("Username already taken", "Username already taken."),
        429: response("TooManyAttempts"),
        500: response("ServerError"),
      },
    },
  },
};

module.exports = { tag, schemas, paths };
