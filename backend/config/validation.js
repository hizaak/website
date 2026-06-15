const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(3).required(),
});

const photoDatePattern = /^\d{2}\/\d{2}\/\d{4}$/;

const workSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
});

const workUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(255),
});

const photoSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  photoDate: Joi.string()
    .pattern(photoDatePattern)
    .required()
    .messages({ "string.pattern.base": "photoDate doit être au format JJ/MM/AAAA." }),
});

const photoUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  photoDate: Joi.string()
    .pattern(photoDatePattern)
    .messages({ "string.pattern.base": "photoDate doit être au format JJ/MM/AAAA." }),
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({ message: "Validation échouée.", errors: messages });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  loginSchema,
  workSchema,
  workUpdateSchema,
  photoSchema,
  photoUpdateSchema,
  validateRequest,
};
