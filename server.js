const mongoose = require('mongoose');

const dotenv = require('dotenv');
// uncaughtException => when a bug happens in the code (synchronous code)
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception');
  console.log(err.name, err.message);
  process.exit(1);
});

//will read the variables from the file and save them in node js enviroment variables.
//SHOULD BE BEFORE REQUIRING THE APP
dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 3000;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// {}
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Success');
  });

//app.get('env') located at process.env
// process.env has all the environment variables set by nodejs
console.log(app.get('env'));
const server = app.listen(port, () => {
  console.log(`server running on port ${port}...`);
});

// Unhandled Regections => when a promise is not handled or rejected
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection');
  console.log(err.name, err.message);
  // 0 for success .... 1 for uncaught exceptions
  // it is better to close the server first then run process.exit()
  // server.close() will give the app time to handle pending requests
  // because process.exit() forces the application to close
  server.close(() => {
    process.exit(1);
  });
});
