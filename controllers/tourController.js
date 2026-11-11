// const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

// will leave it as middleware practice
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is ${val}`);

//   //when we multiply a string that is a number * 1 it will convert it to a number
//   const id = req.params.id * 1;
//   const tour = tours.find((el) => el.id === id);
//   if (id > tours.length || !tour)
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price.',
//     });
//   }
//   next();
// };

exports.aliasTopTour = async (req, res, next) => {
  //pre filling parts of query objects to get the cheapest tours
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAllDocuments(Tour);
//query params ... first way

// const tours = await Tour.find({
//   duration: 5,
//   difficulty: 'easy',
// });
// second way using mongoose methods
// Tour.find() => this returns a query that is why we can chain where and equals
// const tours = await Tour.find()
//   .where('duration')
//   .equals(5)
//   .where('difficulty')
//   .equals('easy');

// //when we multiply a string that is a number * 1 it will convert it to a number
// const id = req.params.id * 1;
// const tour = tours.find((el) => el.id === id);
exports.getTour = factory.getOneDocument(Tour, { path: 'reviews' });
// const newTour = new Tour({})
// call the save method on the document
// newTour.save()
//call create on the Tour model
exports.createTour = factory.createDocument(Tour);
exports.updateTour = factory.updateDocument(Tour);
exports.deleteTour = factory.deleteDocument(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      // first stage
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      // secound stage
      $group: {
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // third stage
      // 1 for ascending
      $sort: { avgPrice: 1 },
    },
    // we can also repeat stages
    // {
    //   // ne => not equal
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  return res.status(200).json({
    status: 'success',
    message: 'Stats retreived successfully.',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStartPerMonth: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    //remove _id from teh output
    { $project: { _id: 0 } },
    {
      $sort: { numToursStartPerMonth: -1 },
    },
    // { $limit: 6 },
  ]);
  return res.status(200).json({
    status: 'success',
    message: 'Stats retreived successfully.',
    data: {
      plan,
    },
  });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //  these numbers are the radius of earth miles ,  kilometers
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the fromat lat,lng.',
        400,
      ),
    );
  }
  const tours = await Tour.find({
    //lng here must come before lat
    // radius must be in radians.
    //$geoWithin -> geospatial operator
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(distance, lat, lng, unit);
  res.status(200).json({
    status: 'success',
    message: 'Documents retrieved successfully!',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  //  these numbers are the radius of earth miles ,  kilometers
  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the fromat lat,lng.',
        400,
      ),
    );
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  //geospacial aggregation is only one stage in aggregation (geoNear)
  const distances = await Tour.aggregate([
    {
      //geoNear must be the first stage
      //geoNear requires that on of the fields contains geospatial index
      //already start location has 2d sphere gespatial index
      //geoNear will use the index to perform the calculations
      //if there are multiple fields with indexes then we need to use keys parameter.
      $geoNear: {
        // will hold the point (lat,lng)
        //define it as geoJson
        near: {
          type: 'Point',
          //multiply by 1 to convert it to number
          coordinates: [lng * 1, lat * 1],
        },
        // the name of the field that will be created
        // and where all the distances will be stored
        distanceField: 'distance',
        distanceMultiplier: multiplier, // Convert meters to kilometers
        key: 'startLocation',
      },
    },
    {
      // only keep the distance and name
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    message: 'Documents retrieved successfully!',

    data: {
      data: distances,
    },
  });
});
