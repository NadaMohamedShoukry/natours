const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});

const Tour = mongoose.Model('Tour', tourSchema);

//default exports
module.exports = Tour;
