const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');

const tourSchema = mongoose.Schema(
  // schema definition
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description.'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image.'],
    },
    images: [String], // array of strings
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // to execlude a field from a schema
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // schema options
  {
    // to show virtual properties in the output
    toJSON: { virtual: true },
    toObject: { virtual: true },
  },
);

// use reqular function t have access to this keyword.
// this this refer to the current document
// durationWeeks will not be saved in database but will be calculate as soon as we get the data.
// we can not use them in query
// (this is bussiness logic s we calculated it in the model)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
// this one runs before only .save() and .create()
// mongoose middlewares also have next() function
// 'save' => called save hook
// called the pre save hook => function (next) {
//   // this refers to the currently processed document
//   this.slug = slugify(this.name, { lower: true });
//   next();
// }
tourSchema.pre('save', function (next) {
  // this refers to the currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// this runs after all the mongoose middlewares
// eslint-disable-next-line prefer-arrow-callback
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE
// this one works only with find query
// we want to make it work with all the expressions that start with find like findOne
// we will use reqular expression
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // filter out true secret tours
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
//docs =>all the documents returned from the query
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} millisecounds`);
  // console.log(docs);
  next();
});

// We want to execlude the secret tour from the aggregation
// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // filter out true secret tours
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline()) // returns an array
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

//default exports
module.exports = Tour;
