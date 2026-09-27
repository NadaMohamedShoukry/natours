const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);

  //when we multiply a string that is a number * 1 it will convert it to a number
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (id > tours.length || !tour)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price.',
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};
exports.getTour = (req, res) => {
  //when we multiply a string that is a number * 1 it will convert it to a number
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tour,
    },
  });
};

exports.addTour = (req, res) => {
  const newId =
    tours.length > 0 ? Math.max(...tours.map((tour) => tour.id)) + 1 : 1;
  // eslint-disable-next-line prefer-object-spread
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    },
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: 'updated data here ....',
  });
};

exports.deleteTour = (req, res) => {
  // no content
  res.status(204).json({
    status: 'success',

    data: null,
  });
};
