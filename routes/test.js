// This module handles routes endpoints for test

// import express from "express";
// import { sendResults, getResults, predict, getTables, getTable_, filter_table, getFilterInfo } from "../controllers/test.js";
// import checkAuth from "../middleware/check-auth.js";
const express = require("express");
const { sendResults,
    getResults,
    predict,
    getTables,
    getTable_,
    filter_table,
    getFilterInfo,
    isTestAvailable, 
    sendSurvey,
    isSurveyCompleted} = require("../controllers/test.js");
const { checkAuth } = require("../middleware/check-auth.js");

const router = express.Router();

router.post("/send-survey", checkAuth, sendSurvey);

router.post("/send", checkAuth, sendResults);

router.get("/get", checkAuth, getResults);

router.get("/predict", checkAuth, predict);

router.get("/search", checkAuth, getTables);

router.post("/table", checkAuth, getTable_);

router.post("/filter", checkAuth, filter_table);

router.post("/getFilterInfo", checkAuth, getFilterInfo);

router.get("/test-available", checkAuth, isTestAvailable);

router.get("/survey-completed", checkAuth, isSurveyCompleted);

exports.testRoutes = router;
