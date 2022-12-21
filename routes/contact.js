//This module handles routes for contact endpoint

// import express from "express";
// import { contact } from "../controllers/contact.js";
// import recaptcha from "../middleware/recaptcha.js";
const express = require('express');
const { contact } = require("../controllers/contact.js");
const { recaptcha } = require("../middleware/recaptcha.js");

const router = express.Router();

router.post("", recaptcha, contact);

exports.contactRoutes = router;
