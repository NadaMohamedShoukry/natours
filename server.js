const mongoose = require('mongoose');

const dotenv = require('dotenv');
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
app.listen(port, () => {
  console.log(`server running on port ${port}...`);
});
