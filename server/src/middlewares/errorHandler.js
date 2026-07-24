const { fail } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err && err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return fail(res, {
      message: 'Validation failed',
      statusCode: 400,
      errors,
    });
  }

  return fail(res, {
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
  });
};

const notFoundHandler = (req, res) => {
  return fail(res, {
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
};

module.exports = { errorHandler, notFoundHandler };
