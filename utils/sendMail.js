require("dotenv").config();
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

// Correctly initialize the Mailgun client
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_KEY,
});


const sendMail = async (to, subject, message) => {
  try {
    const mailData = {
      from: "BizPro CRM <no-reply@sandbox155b42cee2ba4899b23a05964a1f4269.mailgun.org>",
      to,
      subject,
      text: message,
    };

    // send email via Mailgun
    await mg.messages.create(process.env.MAILGUN_DOMAIN,mailData);

    console.log("mail sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};



module.exports = sendMail;