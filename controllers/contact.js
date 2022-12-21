//This module allows sending email for contact with Octaedro

// import fs from "fs";
// import handlebars from "handlebars";
// import dotenv from "dotenv";
// import { smtpTransport } from "../services/send-email.service.js";
// dotenv.config({ path: "./global-variables.env" });
const fs = require("fs");
const handlebars = require("handlebars");
const { smtpTransport } = require("../services/send-email.service.js");
const dotenv = require("dotenv");
dotenv.config({ path: "./global-variables.env" });

exports.contact = (req, res, next) => {
  fs.promises
    .readFile("templates/contact.html", "utf-8")
    .then((html) => {
      var template = handlebars.compile(html);
      var replacements = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
        logoOctaedroUrl: process.env.logoOctaedroUrl
      };
      var htmlToSend = template(replacements);
      var mailOptions = {
        from: process.env.fromEmail,
        to: process.env.contactEmail,
        subject: "¡Has sido contactado!",
        html: htmlToSend,
      };
      return smtpTransport.sendMail(mailOptions);
    })
    .then((info) => {
      return res.status(201).json({
        message:
          "Octaedro ha sido informado de tu contacto, pronto nos contactaremos contigo.",
      });
    })
    .catch((reason) => {
      return res.status(500).json({
        message: reason,
      });
    });
}
