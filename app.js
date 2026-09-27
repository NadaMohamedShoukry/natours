const express = require('express');
// const { json } = require('stream/consumers');
const morgan = require('morgan');
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
app.use((req, res, next) => {
  console.log('hellp from middleware');
  next();
});

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
module.exports = app;
