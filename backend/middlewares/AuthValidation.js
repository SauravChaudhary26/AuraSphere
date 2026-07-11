const Joi = require("joi");

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[a-zA-Z]/, "letter")
  .pattern(/[0-9]/, "number")
  .messages({
    "string.min": "Password must be at least 8 characters",
    "string.pattern.name": "Password must contain at least one {#name}",
  });

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((d) => d.message).join(", "),
    });
  }
  req.body = value;
  next();
};

const signupValidation = validate(
  Joi.object({
    name: Joi.string().min(2).max(100).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: password.required(),
  })
);

const loginValidation = validate(
  Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().max(128).required(),
  })
);

const updateProfileValidation = validate(
  Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    email: Joi.string().email().lowercase().trim(),
    password: password,
    currentPassword: Joi.string().max(128),
    avatar: Joi.string().uri().allow(null, ""),
    notifyByEmail: Joi.boolean(),
  }).or("name", "email", "password", "avatar", "notifyByEmail")
);

const forgotPasswordValidation = validate(
  Joi.object({ email: Joi.string().email().lowercase().trim().required() })
);

const resetPasswordValidation = validate(
  Joi.object({
    id: Joi.string().hex().length(24).required(),
    token: Joi.string().required(),
    password: password.required(),
  })
);

module.exports = {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
