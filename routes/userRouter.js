const express = require("express");
const userRouter = express.Router();
var bcrypt = require("bcryptjs");

const rolesList = require("../roles.json");
const User = require("../db/models/userModel");
const validateJWT = require("../middleware/validateJWT");
const validateRoles = require("../middleware/validateRoles");

// CRUD
// Create
userRouter.post(
  "/",
  [validateJWT, validateRoles(["admin"])],
  async (req, res) => {
    try {
      // Obtenemos informacion del body
      const { username = "", password = "", role = "" } = req.body;

      // Verificamos si existen todos los datos
      if (username.trim() == "" || password.trim() == "" || role.trim() == "") {
        return res.status(400).json({
          msg: "Faltan datos",
        });
      }

      //   Validamos rol
      if (!rolesList.roles.includes(role.trim())) {
        return res.status(400).json({
          msg: `El rol ${role} no existe`,
        });
      }

      // Encryptamos contraseña
      const salt = bcrypt.genSaltSync(10);
      const passwordCrypt = bcrypt.hashSync(password, salt);

      // Creamos el modelo USER de los datos
      const user = new User({
        username,
        password: passwordCrypt,
        role,
      });

      // Verificamos si ya existe el username en la db
      const userExist = await User.findOne({
        username,
      });

      if (userExist) {
        return res.status(400).json({
          msg: "Ya existe un usuario con ese nombre",
        });
      }

      // Guardamos en la base de datos
      await user.save();

      // Damos una respuesta
      res.status(200).json({
        username: user.username,
        role: user.role,
        id: user._id
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        msg: "Por favor comuniquese con el desarollador backend",
      });
    }
  }
);

// READ
userRouter.get("/", async (req, res) => {
  try {
    const users = (await User.find()).map(({ username, role, _id }) => {
      return {
        username,
        role,
        id: _id,
      };
    });
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Por favor comuniquese con el desarollador backend",
    });
  }
});

// update ... Mas adelante :v

// DELETE
userRouter.delete(
  "/",
  [validateJWT, validateRoles(["admin"])],
  async (req, res) => {
    // Obtenemos mediante el id el usuario a eliminar
    try {
      const { id = "" } = req.body;

      // Verificamos si el id existe
      if (id.trim() == "") {
        return res.status(400).json({
          msg: "Se nesesita de un id de usuario",
        });
      }

      
      // Validamos si existe el id de usuario
      const user = await User.findById(id);

      if (!user) {
        return res.status(400).json({
          msg: "No existe ese usuario",
        });
      }

    
      // Verificamos si se esta intentado autoeliminar JAJAJS
      if(req.authUser.username == user.username) {
        return res.status(400).json({
          msg: 'No puedes eliminar tu usuario'
        })
      }

      // Si existe lo eliminamos
      await User.findByIdAndDelete(id);

      return res.status(200).json({
        user: user._id,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        msg: "Por favor comuniquese con el desarollador backend",
      });
    }
  }
);

module.exports = userRouter;
