const mongoose = require("mongoose");

const teacherSchema = mongoose.Schema({
  username: String,
  password: String,
  accType: { type: String, default: "teacher" },
  email: String,
  phone: String,
});

module.exports = mongoose.model("Teacher", teacherSchema);
