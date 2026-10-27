const express = require('express');
// const { json } = require('stream/consumers');
const morgan = require('morgan');
const AppError = require('./utils/appError');
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

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', addTour);

// app.patch('/api/v1/tours/:id',updateTour );

// app.delete('/api/v1/tours/:id',deleteTour );

//mounting the routers
// create tour router middleware
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// will run for all the HTTP methods
// will run when the route isnot included in any of the previous routes
// THIS SHOULD BE PUT AT THE END OF MIDDLEWARE STACK
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} in this server!`,
  // });
  // // next();

  // use error constructor
  const err = new Error(`Can't find ${req.originalUrl} in this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});
module.exports = app;
