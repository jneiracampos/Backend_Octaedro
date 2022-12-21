// This module handles express app endpoints

// import path from "path";
// import express from "express";

// import dotenv from "dotenv";
// dotenv.config({ path: "./global-variables.env" });

// import usersRoutes from "./routes/users.js";
// import contactRoutes from "./routes/contact.js";
// import testRoutes from "./routes/test.js";

// ------------------------------------------------------------

const path = require("path")
const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./global-variables.env" });
const { usersRoutes } = require("./routes/users.js");
const { contactRoutes } = require("./routes/contact.js");
const { testRoutes } = require("./routes/test.js");


const app = express();

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
// app.use("/images", express.static(path.join("backend/images")));
app.use("/", express.static(path.join(__dirname, "angular")));

//Set and allow headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/users", usersRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/test", testRoutes);
app.use((req, res, next) => {
   res.sendFile(path.join(__dirname, "angular", "index.html"));
});
exports.app = app;
