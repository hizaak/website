const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

const photoSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  date: Joi.date().required(),
  serie: Joi.string().hex().length(24),
});

const photoUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  date: Joi.date(),
  serie: Joi.string().hex().length(24),
});

const serieSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  years: Joi.string()
    .pattern(/^\d{4}(-\d{4})?$/)
    .required(),
});

const serieUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(255),
  years: Joi.string().pattern(/^\d{4}(-\d{4})?$/),
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
  photoSchema,
  photoUpdateSchema,
  serieSchema,
  serieUpdateSchema,
  validateRequest,
};
