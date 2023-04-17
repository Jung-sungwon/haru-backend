const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: String,
  period: { type: [String] },
  purpose: { type: String },
  userId: { type: String },
  projectId: { type: String, unique: true },
});

module.exports = mongoose.model("Project", projectSchema);
