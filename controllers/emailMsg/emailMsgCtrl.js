const expressAsyncHandler = require("express-async-handler");
const nodemailer = require('nodemailer');
const EmailMsg = require("../../models/EmailMesaging/EmailMesaging");
const Filter = require('bad-words')
const sendEmailMsgCtrl = expressAsyncHandler(async (req, res) => {
    // console.log(req.user);
    const { to, subject, message } = req.body
    //get the message
    const emailMessage = subject + ' ' + message;
    //prevent bad word
    const filter = new Filter();
    const isProfane = filter.isProfane(emailMessage);
    if(isProfane) throw new Error("Email sent failed, because it contains profane words")
    // console.log(emailMessage)
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        // Build up the email options
        const mailOptions = {
            from: "trantintin1989@gmail.com",
            to: to,
            subject: subject,
            text: message,
        };

        await transporter.sendMail(mailOptions);
        // Save to your database (you can adapt this part based on your model)
        await EmailMsg.create({
            sentBy: req?.user?._id,
            from: "trantintin1989@gmail.com", // Replace with your Gmail email address
            to: to,
            message: message,
            subject: subject,
        });
        res.json("Mail sent");
    } catch (error) {
        res.json(error)
    }
})
module.exports = { sendEmailMsgCtrl };
