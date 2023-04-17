const mongoose = require("mongoose");

const calDetailSchema = new mongoose.Schema({
  detail: String,
  hour: { type: Number },
  min: { type: Number },
  period: { type: Number },
  day: { type: Number },
  projectId: { type: String },
  check: { type: Boolean, default: false },
});

module.exports = mongoose.model("Caldetail", calDetailSchema);
