const express = require('express');
// const { json } = require('stream/consumers');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  //to get information about the request that we sent in the console
  app.use(morgan('dev'));
}
// 1- Middlewares

//middleware -> a function that can modify the incomming request.
app.use(express.json());
// app.get('/', (req, res) => {
//   res.status(200).send('Hello from the server side');
// });

// built in middleware to access all the static files and images.
app.use(express.static(`${__dirname}/public`));
// app.use((req, res, next) => {
//   console.log('hellp from middleware');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // to convert it to a readable string;
  next();
});

//mounting the routers
// create tour router middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// will run for all the HTTP methods
// will run when the route isnot included in any of the previous routes
// THIS SHOULD BE PUT AT THE END OF MIDDLEWARE STACK
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} in this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
