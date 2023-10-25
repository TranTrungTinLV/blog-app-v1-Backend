const expressAsyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password'
  }
});


module.exports = transporter;