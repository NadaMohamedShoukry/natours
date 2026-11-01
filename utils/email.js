const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1 - create transporter
  const transporter = nodemailer.createTransport({
    // will use service mailtrap not gmail
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME);
  //2- Define the email options
  const mailOptions = {
    from: 'Nada Shoukry <hello@nada.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  await transporter.verify();
  console.log('SMTP connection established successfully!');

  await transporter.sendMail(mailOptions);
  console.log('Email sent successfully!');
  // Send the email
  //   await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
