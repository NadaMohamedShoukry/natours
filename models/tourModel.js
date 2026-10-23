const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name.'],
    unique: true,
    trim: true,
  },
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
});

const Tour = mongoose.model('Tour', tourSchema);

//default exports
module.exports = Tour;
