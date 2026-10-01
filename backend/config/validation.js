const Joi = require("joi");

const usernameRule = Joi.string().alphanum().min(3).max(30);

const loginSchema = Joi.object({
  username: usernameRule.required(),
  password: Joi.string().min(3).required(),
});

// A few words are easier to remember than a short random password, and as
// hard to guess.
const ADMIN_PASSWORD_MIN_LENGTH = 10;

// Either field can be left out to keep the current value.
const accountUpdateSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newUsername: usernameRule,
  newPassword: Joi.string().min(ADMIN_PASSWORD_MIN_LENGTH).max(200),
}).or("newUsername", "newPassword");

// The day a photo was taken, as sent by <input type="date">. Converted to a
// Date at midnight UTC.
const photoDateRule = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    // Rejects impossible days such as 2023-02-30, which Date would roll over.
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
      ? helpers.error("any.invalid")
      : date;
  })
  .messages({
    "string.pattern.base": "photoDate must be in YYYY-MM-DD format.",
    "any.invalid": "photoDate is not a valid date.",
  });

const workSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
});

const workUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(255),
});

const photoSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  photoDate: photoDateRule.required(),
});

const photoUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  photoDate: photoDateRule,
});

const photoReorderSchema = Joi.object({
  photoIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .unique()
    .required(),
});

const documentSchema = Joi.object({
  name: Joi.string().trim().allow("").max(120),
  replace: Joi.boolean().default(false),
});

const documentRenameSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({ message: "Validation failed.", errors: messages });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  ADMIN_PASSWORD_MIN_LENGTH,
  loginSchema,
  accountUpdateSchema,
  workSchema,
  workUpdateSchema,
  photoSchema,
  photoUpdateSchema,
  photoReorderSchema,
  documentSchema,
  documentRenameSchema,
  validateRequest,
};
