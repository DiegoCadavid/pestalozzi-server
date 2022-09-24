const { Schema, model } = require("mongoose");

const galerySchema = new Schema({
  url: { type: Schema.Types.String, unique: true },
  date: { type: Schema.Types.Number },
  fileId: {type: Schema.Types.String, unique: true}
});

const Galery = model("Galery", galerySchema);
module.exports = Galery;
