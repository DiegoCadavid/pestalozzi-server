const express = require("express");
const authRouter = express.Router();

const User = require("../db/models/userModel");

var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const verifyJWT = require("../helpers/verifyJWT");

authRouter.get("/", (req, res) => {
  res.status(200).json({ msg: "path test" });
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username = "", password = "" } = req.body;
    // Validamos los datos
    if (username.trim() == "" || password.trim() == "") {
      return res.status(400).json({
        msg: "Debe introducir todos los datos",
      });
    }

    // Validamos si el usuario existe en la DB
    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res.status(400).json({
        msg: "El usuario no existe",
      });
    }

    // Comparamos contraseña con la de la base de datos
    const comparePassword = bcrypt.compareSync(password, user.password);

    if (!comparePassword) {
      return res.status(401).json({
        msg: "Contraseña incorrecta",
      });
    }

    //Creamos el JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT__KEY);

    res.status(200).json({
      auth: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Por favor comuniquese con el desarollador backend",
    });
  }
});

authRouter.post("/verify", async (req, res) => {
  const { auth } = req.body;

  if (!auth) {
    return res.status(400).json({
      msg: "se nesesita de un token",
    });
  }

  verifyJWT(auth)
    .then(( ok ) => {
      return res.status(200).json(ok);
    })
    .catch((err) => {
      console.log(err);
      return res.status(200).json(err);
    });
});

module.exports = authRouter;
