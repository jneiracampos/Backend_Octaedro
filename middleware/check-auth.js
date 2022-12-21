// This module implements authorization middlewares for decoding tokens
// import jwt from "jsonwebtoken";
const jwt = require("jsonwebtoken");

exports.checkAuth = (req, res, next) => {
  try {
    let token = req.query["token"];
    if (token == ""){
      token = req.query["token_reset"]
    }

    const decodedToken = jwt.verify(token, process.env.jwt_key);
    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
      isAdmin: decodedToken.isAdmin,
    };
    next();
  } catch (error) {
      console.log(error);
    res.status(401).json({ message: "Usted no está autenticado." });
  }
};
