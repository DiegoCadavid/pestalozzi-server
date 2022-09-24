const express = require("express");
const galeryRouter = express.Router();
const Galery = require("../db/models/galeryModel"); //Galery model

const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  api_key: process.env.CLOUDINARY__API_KEY,
  api_secret: process.env.CLOUDINARY__API_SECRET,
  cloud_name: process.env.CLOUDINARY__CLOUD_NAME,
});
const configCloudinary = {
  folder: "pestalozzi",
};

const validateJWT = require("../middleware/validateJWT");
const validateRoles = require("../middleware/validateRoles");

// CRUD
// Create
galeryRouter.post(
  "/",
  [validateJWT, validateRoles(["admin", "teacher"])],
  (req, res) => {
    try {
      // Validamos si existen las imagenes
      if (!req.files?.image) {
        return res.status(400).json({
          msg: "Nesesita enviar archivos",
        });
      }

      //Verificamos si envio un grupo de imagenes
      if (req.files.image[0]) {
        return res.status(400).json({
          msg: "Solo puede enviar una imagen",
        });
      }

      // Validamos si el archivo es una  imagen
      const image = req.files.image;

      if (image.mimetype.split("/")[0] != "image") {
        return res.status(400).json({
          msg: "El archivo debe ser una imagen",
        });
      }

      // Guardamos la imagen en cloudinary
      const upload_stream = cloudinary.uploader.upload_stream(
        configCloudinary,
        async (error, result) => {
          if (error) {
            return res.status(500).json({
              msg: "Error cloudinary",
            });
          }

          // Enviamos la response
          // Creamos el modelo de la db

          const galery = new Galery({
            url: result.secure_url,
            date: Date.parse(new Date()),
            fileId: result.public_id,
          });

          // guardamos en la db
          await galery.save();

          return res.status(200).json({
            url: galery.url,
            date: galery.date,
            id: galery._id,
          });
        }
      );

      streamifier.createReadStream(image.data).pipe(upload_stream);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        msg: "Por favor comuniquese con el desarollador backend",
      });
    }
  }
);

// READ
galeryRouter.get("/", async (req, res) => {
  // Obtenemos todas las imagenes
  try {
    const galeries = await (
      await Galery.find()
    )
      .map((g) => {
        return {
          url: g.url,
          date: g.date,
          id: g._id,
        };
      })
      .sort((a, b) => {
        if (a.date > b.date) return -1;
        else if (a.date < b.date) return 1;
        else return 0;
      });

    // Order

    res.status(200).json(galeries);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Por favor comuniquese con el desarollador backend",
    });
  }
});


// DELETE
galeryRouter.delete("/", async (req, res) => {
  try {
    // Obtenemos el id de la imagen mediante el body
    const { id } = req.body;

    // Validamos el id
    if (!id) {
      return res.status(400).json({
        msg: "Nesesita enviar el id de una imagen",
      });
    }

    // Validamos si existe la imagen
    const galery = await Galery.findById(id);

    if (!galery) {
      return res.status(400).json({
        msg: "No existe esa imagen",
      });
    }

    cloudinary.uploader.destroy(galery.fileId, async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          msg: "Error al eliminar la iamgen",
        });
      }

      // Eliminamos la imagen
      await Galery.findByIdAndRemove(id);

      // Enviamos una respuesta
      res.status(200).json({
        id,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Por favor comuniquese con el desarollador backend",
    });
  }
});

module.exports = galeryRouter;
