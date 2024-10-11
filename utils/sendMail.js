require("dotenv").config();
const nodemailer = require("nodemailer");

// const formData = require("form-data");
// const Mailgun = require("mailgun.js");
// const mailgun = new Mailgun(formData);

// // Correctly initialize the Mailgun client
// const mg = mailgun.client({
//   username: "api",
//   key: process.env.MAILGUN_KEY,
// });

// create nodemailer transporter

const transporter = nodemailer.createTransport({
  host: "smtp.mail.us-east-1.awsapps.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMPTP_PASS,
  },
});

const sendMail = async (to, subject, message) => {
  try {
    const mailData = {
      from: "BizPro CRM <khurshid@qurilo.com>",
      to, 
      subject,
      text: message,
    };

    // send email via Nodemailer
    await transporter.sendMail(mailData);

    console.log("mail sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendMail;
