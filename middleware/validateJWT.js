const { request } = require("express");
var jwt = require("jsonwebtoken");
const User = require("../db/models/userModel");

const validateJWT = async(req = request, res, next) => {
  const authJWT = req.headers.auth;

  // Verificamos si existe
  if (!authJWT) {
    return res.status(401).json({
      msg: "Se nesesita autenticarse",
    });
  }

  // Verificamos el jwt
  jwt.verify(authJWT, process.env.JWT__KEY, async(err, decoded) => {
    if (err) {
      return res.status(400).json({
        msg: "Autenticacion invalida",
      });
    }


    // Buscamos en la DB el usuario autenticado
    const user = await User.findById(decoded.id);

    // Verificamos si el usuario en la DB existe 
    if(!user){
        return res.status(400).json({
            msg: 'El usuario autenticado no existe'
        })
    }

    // LOG
    req.authUser = {
        username: user.username,
        role: user.role,
        id: user._id
    };

    next();
  });
};

module.exports = validateJWT;
