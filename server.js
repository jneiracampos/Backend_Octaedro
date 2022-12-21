// This module handles all the server 

// import app from "./app.js";
// import debug from "debug";
// import http from "http";

const { app } = require("./app.js")
const debug = require("debug");
const http = require("http");

// Verify if received port is valid (for example from env variables)
const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

// Error Handling
const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Indicate that we are listening to incoming requests if everything was ok
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  debug("Listening on " + bind);
};

// Get port
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

// Create and turn on server
const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, () => {
  console.log("Server listening...");
});
