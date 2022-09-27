const express = require("express");
require("dotenv").config();
const cors = require("cors");
const fileUpload = require("express-fileupload");

const connectDB = require("./db/connectDB");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(fileUpload());
app.use(express.static("public"));

// Routas
const userRouter = require("./routes/userRouter");
app.use("/user", userRouter);

const authRouter = require("./routes/authRouter");
app.use("/auth", authRouter);

const galeryRouter = require("./routes/galeryRouter");
app.use("/galery", galeryRouter);

const carouselRouter = require("./routes/carouselRouter");
app.use("/carousel", carouselRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`-----------------------`);
  console.log(`Servidor iniciado ${port}`);
});
