import ApiError from '../utils/ApiError.js';

const globalErrorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    error = new ApiError(statusCode, error.message || 'Internal server error');
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((item) => item.message)
      .join('; ');
    error = new ApiError(400, message || 'Validation failed');
  }

  if (err.code === 11000) {
    if (Object.prototype.hasOwnProperty.call(err.keyPattern || {}, 'email')) {
      error = new ApiError(409, 'User with this email already exists');
    } else if (
      Object.prototype.hasOwnProperty.call(err.keyPattern || {}, 'name') ||
      Object.prototype.hasOwnProperty.call(err.keyPattern || {}, 'slug')
    ) {
      error = new ApiError(409, 'A company with this name already exists');
    } else {
      error = new ApiError(409, 'Duplicate field value entered');
    }
  }

  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}`);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token has expired');
  }

  const response = {
    success: false,
    message: error.message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

export default globalErrorHandler;
