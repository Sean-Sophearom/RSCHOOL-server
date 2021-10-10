const mongoose = require("mongoose");

const chapterSchema = mongoose.Schema({
  teacher: String,
  title: String,
  description: [],
  exercises: [],
});

module.exports = mongoose.model("Chapter", chapterSchema);
