const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  username: String,
  password: String,
  gender: String,
  teacher: String,
  accType: { type: String, default: "student" },
  email: String,
  phone: String,
  chapters: [],
  numOfDone: { type: Number, default: 0 },
  numOfCorrectlyDone: { type: Number, default: 0 },
  numOfQuestions: { type: Number },
  start: { type: Date, default: Date.now() },
  end: { type: Date, default: () => Date.now() + 62 * 24 * 60 * 60 * 1000 },
});

module.exports = mongoose.model("Students", studentSchema);
