const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    //Parent referencing => 1 tour or user many reviews
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a tour.'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to an author.'],
    },
  }, // schema options
  {
    // to show virtual properties in the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  //save the statistics to the tour
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].avgRating,
  });
};
// post -> to run it after the new review is added to the collection so we can match the id and calulate the avg.
// the post middleware does not have access to post.
reviewSchema.post('save', function () {
  //this points to the current review (document)
  //constructor => the model that created the document.(Review)
  //the  this.constructor => points to the review
  this.constructor.calcAverageRating(this.tour);
});
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name photo' });
  // this.populate({ path: 'tour', select: 'name' });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
