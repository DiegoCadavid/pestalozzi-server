var jwt = require("jsonwebtoken");
const User = require("../db/models/userModel");

const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT__KEY, async (err, decoded) => {
      if (err) {
        return reject({
            data: false,
            msg: 'Se nesesita de un token valido'
        });
      }

      // Buscamos en la DB el usuario autenticado
      const user = await User.findById(decoded.id);

      // Verificamos si el usuario en la DB existe
      if (!user) {
        return reject({
            data: false,
            msg : 'No se encontro el usuario en la base de datos'
        })
      }

      return resolve({
        data: true,
        user: {
            username: user.username,
            role: user.role,
            id: user._id,
            auth: token
        } ,
        msg: 'Token verificado!'
      });
    });
  });
};

module.exports = verifyJWT;
