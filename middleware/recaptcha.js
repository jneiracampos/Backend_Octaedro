//This module checks google's recaptcha

// import fetch from "node-fetch";
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config({ path: "./global-variables.env" });

exports.recaptcha = (req, res, next) => {
//  const url = `${process.env.recaptchaUrl}?secret=${process.env.recaptchaSecret}&response=${req.body.recaptcha}&remote_ip=${req.connection.remoteAddress}`;
//  fetch(url, { method: "POST" })
//     .then((captchaVerified_) => {
//      return captchaVerified_.json();
//     }).then(captchaVerified => {
//      if (!captchaVerified.success) {
//         return res.status(401).json({ message: "Recaptcha inválido." });
//      }
      next();
    // })
    // .catch((reason) => {
    //  return res.status(500).json({
    //     message: reason,
    //  });
    // });
};
