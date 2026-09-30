const { ADMIN_PASSWORD_MIN_LENGTH } = require("../validation");
const { ref, response, json, jsonBody, secured } = require("./helpers");

const tag = { name: "Authentication", description: "Admin login and account" };

const username = {
  type: "string",
  pattern: "^[a-zA-Z0-9]{3,30}$",
  description: "Letters and digits, 3 to 30 characters.",
};

const schemas = {
  LoginRequest: {
    type: "object",
    description: "Body of POST /login.",
    required: ["username", "password"],
    properties: {
      username,
      password: { type: "string", format: "password", minLength: 3 },
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
    description: "Body of PUT /account: at least one of newUsername and newPassword.",
    required: ["currentPassword"],
    properties: {
      currentPassword: { type: "string", format: "password" },
      newUsername: username,
      newPassword: {
        type: "string",
        format: "password",
        minLength: ADMIN_PASSWORD_MIN_LENGTH,
        maxLength: 200,
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
        400: response("ValidationError"),
        401: json(ref("Message"), "Invalid credentials"),
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
        401: response("Unauthorized"),
        500: response("ServerError"),
      },
    },
    put: {
      tags: [tag.name],
      summary: "Change the username and/or password",
      security: secured,
      requestBody: jsonBody(ref("AccountUpdate")),
      responses: {
        200: json(ref("Account"), "Account updated"),
        400: response("ValidationError"),
        401: response("Unauthorized"),
        403: json(ref("Message"), "Current password is incorrect"),
        409: json(ref("Message"), "Username already taken"),
        429: response("TooManyAttempts"),
        500: response("ServerError"),
      },
    },
  },
};

module.exports = { tag, schemas, paths };
