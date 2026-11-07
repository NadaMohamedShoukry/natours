const express = require('express');
// const { json } = require('stream/consumers');
const morgan = require('morgan');
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');

// eslint-disable-next-line import/no-extraneous-dependencies
const mongoSanitize = require('express-mongo-sanitize');
// eslint-disable-next-line import/no-extraneous-dependencies
const xss = require('xss-clean');

// eslint-disable-next-line import/no-extraneous-dependencies
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
// 1- Global Middlewares
// Set security HTTP headers
// should be put on the top of the stack
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  //to get information about the request that we sent in the console
  app.use(morgan('dev'));
}
//To prevent attacks like denial of service and brute force
//count the number of requests comming from the same IP in a certain amount of time.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //1hr
  message: 'Too many requests from this IP. Please try again in an hour.',
});
// will be applied on all the routes that starts with /api
app.use('/api', limiter);
//middleware -> a function that can modify the incomming request.

//Body parser : reading data from body in req.body
// here we can limit the amount of data sent in the body.
app.use(express.json({ limit: '10kb' }));

// Data sanitization aganist NoSQL query injection.
// this middleware looks at the request body, the request querystring and also the request.params
// and it will filter out all the dollar sign and dots because that is how mongoDB operators are written

app.use(mongoSanitize());
// Data sanitization aganist xss cross site scripting
//this will clean any user input from malicious HTML code
// converts HTML code to a string entity
app.use(xss());
//HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ], // to allow duplicate query string
  }),
);
//Serving Static files
// built in middleware to access all the static files and images.
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // to convert it to a readable string;
  next();
});

//mounting the routers
// create tour router middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// will run for all the HTTP methods
// will run when the route isnot included in any of the previous routes
// THIS SHOULD BE PUT AT THE END OF MIDDLEWARE STACK
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} in this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
