const { config } = require("../config");

/** 404 handler for unmatched routes — always returns JSON. */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Central error handler. Normalises common error types (validation, bad JSON,
 * duplicate keys, cast errors) into clean JSON and hides internals in prod.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed JSON in request body";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(", ") || "Validation failed";
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} is already in use`;
  }

  if (status >= 500) {
    console.error("[error]", err);
    if (config.isProd) message = "Internal server error";
  }

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
