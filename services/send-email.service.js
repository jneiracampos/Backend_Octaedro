// This module handles email object for sending emails

// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config({ path: "./global-variables.env" });

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./global-variables.env" });


exports.smtpTransport = nodemailer.createTransport({
  host: process.env.hostEmail,
  port: process.env.portEmail,
  secure: process.env.securePort === 'true' || process.env.securePort === true,
  auth: {
    user: process.env.userEmail,
    pass: process.env.passwordEmail
  },
});
