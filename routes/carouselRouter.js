const express = require("express");
const carouselRouter = express.Router();

// Db model
const Carousel = require("../db/models/carouselModel");

// Middlewares
const validateJWT = require("../middleware/validateJWT");
const validateRoles = require("../middleware/validateRoles");

// CRUD
// CREATE
carouselRouter.post(
  "/",
  [validateJWT, validateRoles(["admin", "teacher"])],
  async (req, res) => {
    try {
      // Obtenemos la informacion del body
      const { imageId = "", label = "" } = req.body;

      // Validamos los datos
      if (imageId.trim() == "" || label.trim() == "") {
        return res.status(400).json({
          msg: "Debe de introducir todos los datos",
        });
      }

      // Crear el modelo de la DB
      const carousel = await new Carousel({
        imageId,
        label,
      }).populate("imageId");

      console.log(carousel);

      // Guardamos modelo en la base de datos
      await carousel.save();

      // Enviamos la respuesta
      res.status(200).json({
        url: carousel.imageId.url,
        date: carousel.imageId.date,
        label: carousel.label,
        id: carousel._id,
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
carouselRouter.get("/", async (req, res) => {
  try {
    const carousels = (await Carousel.find().populate("imageId"))
      .map((c) => {
        return {
          url: c.imageId?.url || null,
          date: c.imageId?.date || null,
          label:  c.label ,
          id: c._id,
        };
      })
      .sort((a, b) => {
        if (a.date > b.date) return -1;
        else if (a.date < b.date) return 1;
        else return 0;
      });

    res.status(200).json(carousels);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Por favor comuniquese con el desarollador backend",
    });
  }
});

// DELETE
carouselRouter.delete(
  "/",
  [validateJWT, validateRoles(["admin", "teacher"])],
  async (req, res) => {
    try {
      // Obtenemos el id del carousel
      const { id = "" } = req.body;

      if (id == "") {
        return res.status(400).json({
          msg: "Debe de enviar un id",
        });
      }

      // Lo buscamos y eliminamos de la base de datos
      const carousel = await Carousel.findByIdAndRemove(id);
      if (!carousel) {
        return res.status(400).json({
          msg: "no existe un item con ese id",
        });
      }

      res.status(200).json({
        id,
      });
    } catch (error) {
      console.log(err);
      res.status(500).json({
        msg: "Por favor comuniquese con el desarollador backend",
      });
    }
  }
);
module.exports = carouselRouter;
