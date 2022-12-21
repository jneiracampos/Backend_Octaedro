// This module handles users endpoints routes

// import express from "express";

// import {
//   allowAccess,
//   changePassword,
//   createUser,
//   forgotPassword,
//   userLogin,
// } from "../controllers/users.js";
// import checkAuth from "../middleware/check-auth.js";
// import recaptcha from "../middleware/recaptcha.js";

const express = require('express');
const multer = require('multer');
const upload = multer();
const {
  allowAccess,
  changePassword,
  createUser,
  forgotPassword,
  userLogin,
  checkAdmin,
  updateDb,
  processPayments,
  updateUserInfo,
  chunkUpdate,
  getUserInfo
} = require("../controllers/users.js");
const { checkAuth } = require("../middleware/check-auth.js");
const { recaptcha } = require("../middleware/recaptcha.js");



const router = express.Router();

router.post("/allow", checkAuth, recaptcha, allowAccess);

router.post("/signup", recaptcha, createUser);

router.post("/payments/ipn", processPayments);
router.get("/payments/ipn", processPayments);

router.post("/login", recaptcha, userLogin);

router.post("/forgot", recaptcha, forgotPassword);

router.post("/change", checkAuth, recaptcha, changePassword);

router.post("/admin", checkAuth, checkAdmin);

router.post("/info", checkAuth, updateUserInfo);

router.get("/info", checkAuth, getUserInfo);

router.post("/updateDb", upload.single('file_csv'), updateDb);

router.post("/chunkUpdate", upload.single('file_csv'), chunkUpdate);

exports.usersRoutes = router;
