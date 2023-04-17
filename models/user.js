const mongoose = require("mongoose");
const { createHash } = require("node:crypto");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  hash_password: { type: String },
  salt: { type: String },
  role: { type: String, default: "subscriber" },
});

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hash_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  makeSalt: function () {
    let ran = Math.floor(new Date().getTime() * (Math.random() * 100));
    return ran.toString();
  },
  encryptPassword: function (password) {
    const hash = createHash("sha256")
      .update(password + this.salt)
      .digest("hex");
    return hash;
  },
  checkPassword: function (plainPW) {
    return this.hash_password === this.encryptPassword(plainPW);
  },
};

module.exports = mongoose.model("User", userSchema);
