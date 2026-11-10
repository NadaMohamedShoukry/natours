const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');

// eslint-disable-next-line import/no-extraneous-dependencies
const validator = require('validator');

const User = require('./userModel');

const tourSchema = mongoose.Schema(
  // schema definition
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'], // validator
      unique: true,
      trim: true,
      maxLength: [40, 'Tour name must have less or equal 40 characters'], //validator with strings
      minLength: [10, 'Tour name must have more or equal 10 characters'], //validator  with strings
      // not usufull here ... use it when you do not want numbers or spaces
      // validate: [validator.isAlpha, 'Tour name must only contain charaters.'], // external library
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy , difficult , medium ',
      }, // validator only with strings
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be more that 1.0'], //validator
      max: [5, 'Ratings must be below 5.0'], //validator
      set: (val) => Math.round(val * 10) / 10, //setter function -> a function that will be set each time a new value is set in the field
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
      //custom validator
      validate: {
        validator: function (val) {
          // will work only with create document
          // it will not work on update document
          return val < this.price;
        },
        // ({VALUE})not is JS but in mongoose
        message: 'Discount ({VALUE}) must be less than the price',
      },
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
    startLocation: {
      //geoJSON -> in order to model geospatial data
      type: {
        type: String,
        default: 'Point', // geoMetries default value .... we also have polygon , line.
        enum: ['Point'], // because it is a location.
      },
      coordinates: [Number], // array of numbers with the longitude first then the latitude (That is how it works in geoJSON)
      address: String,
      description: String,
    },
    //In order to have a document embeded in another document we need an array
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number, //day of the tour
      },
    ],
    // guides: Array, solution 1 embedding
    guides: [
      // solution 2 referencing  ---- here we will store guides ids without geting the docs.
      {
        type: mongoose.Schema.ObjectId, // will store mongo object ids
        ref: 'User',
      },
    ],
  },

  // schema options
  {
    // to show virtual properties in the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
//Apply index to enhance the read - performace
// tourSchema.index({ price: 1});  // single index
tourSchema.index({ price: 1, ratingsAverage: -1 }); //compound index - order is important
tourSchema.index({ slug: 1 });
// use reqular function t have access to this keyword.
// this this refer to the current document
// durationWeeks will not be saved in database but will be calculate as soon as we get the data.
// we can not use them in query
// (this is bussiness logic s we calculated it in the model)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual Populate
// reviews referes to a virtual field that is going to show on query not saved in database
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', /// comming from tour in Reviews
  localField: '_id', // The id from the Tour model
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
// This is the solution t embed user docs in the tours
// each id in the array of guides in tours will get the user doc behind the scenes
// works only with creating docs ... so we need to write the same logic for updates
// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

//////////////////////////////////////////////////////////////////////////
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
//to populate the ref users in the tours
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
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
