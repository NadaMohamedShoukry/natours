const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}!`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/([^']*)'|"([^"]*)/);
  const message = `Duplicate value: ${value}. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired. Please login again', 401);

const sendErrorProd = (err, res) => {
  // first handle operational errors
  // send the message to the clien in prod
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // log error for us developers
    console.error('Error:', err);
    // send generic error for programming errors
    // do not want to send it to client
    res.status(500).json({
      status: 'error',
      message: 'Somethig went wrong!',
    });
  }
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    // for invalid ids
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    // for duplicate data
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    // validation error
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    // JWT Error
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    // Token expired error
    if (error.name === 'TokenExpiredError') {
      error = handleTokenExpiredError();
    }

    sendErrorProd(error, res);
  }
};
