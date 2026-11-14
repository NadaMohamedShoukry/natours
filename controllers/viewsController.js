exports.getOverview = (req, res) => {
  //will rener the template we pass in
  res.status(200).render('overview', {
    title: 'All Tours',
  });
};

// exports.getBase = (req, res) => {
//   //will rener the template we pass in
//   res.status(200).render('base', {
//     // how to pass data to the template
//     // they are called locals in pug file
//     tour: 'The forest hiker',
//     user: 'Nada',
//   });
// };

exports.getTourDetails = (req, res) => {
  //will rener the template we pass in
  res.status(200).render('tour', {
    title: 'Tour details',
  });
};
