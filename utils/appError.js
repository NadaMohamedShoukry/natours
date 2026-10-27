class AppError extends Error {
  constructor(message, statusCode) {
    //pass message to the parent constructor as the Error accepts message parameter
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // this => current opject
    // this.constructor =>Tells Node.js where to start the visible stack trace,
    // excluding calls inside your custom error constructor.
    //The stack trace starts from where the error was created or thrown, rather than showing the internal AppError constructor as an extra stack frame.

    // In simple terms: this line makes your error's stack trace cleaner and more useful for debugging.
    // It's optional, but helpful when creating custom errors in Node.js.
    Error.captureStackTrace(this, this.constructor);
  }
}

// What is a stack trace?
// A stack trace shows the sequence of function calls that led to an error.
// It's useful for debugging because it helps you identify where the error occurred.

module.exports = AppError;
