const crypto = require("crypto");

// generate a random token and expiration time (1 hour validity)

exports.generateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 60 * 60 * 1000; // 1 hour from now

  return { token, expires };
};
