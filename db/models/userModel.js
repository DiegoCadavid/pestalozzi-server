const { Schema, model } = require("mongoose");

// Solo se podran crear 3 tipos de roles
// admin - teacher - student

const userSchema = new Schema({
  username: { type: Schema.Types.String, unique: true },
  password: String,
  role: String,
});

const User = model("User", userSchema);
module.exports = User;
