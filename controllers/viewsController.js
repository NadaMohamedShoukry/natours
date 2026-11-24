const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template

  // 3) Render the template using the data
  //will rener the template we pass in
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

// exports.getBase = (req, res) => {
//   //will rener the template we pass in
//   res.status(200).render('base', {
//     // how to pass data to the template
//     // they are called locals in pug file
//     tour: 'The forest hiker',
//     user: 'Nada',
//   });
// };

exports.getTourDetails = catchAsync(async (req, res) => {
  const { slug } = req.params;
  // 1) Get the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  // 2) Build template
  // 3) Render template using tour data
  //will rener the template we pass in
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour,
  });
});
