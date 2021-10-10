const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../schemas/Teacher");
const Student = require("../schemas/Student");

const registerFunc = async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await new User({ username, password: hashedPassword, phone, email }).save();
    res.status(201).json({ ...newUser, password: undefined });
  } catch (error) {
    res.json(erro);
  }
};

const loginFunc = async (req, res) => {
  try {
    const { username, password } = req.body;
    let teacher;
    let student;
    //check if the account exists
    if (username.includes("@")) {
      teacher = await User.findOne({ email: username });
      if (!teacher) {
        student = await Student.findOne({ email: username });
        if (!student) res.status(404).json({ message: `No account with email ${username} found.` });
      }
    } else {
      teacher = await User.findOne({ phone: username });
      if (!teacher) {
        student = await Student.findOne({ phone: username });
        if (!student) res.status(404).json({ message: `No account with phone number ${username} found.` });
      }
    }
    if (teacher) {
      const validPassword = await bcrypt.compare(password, teacher.password);
      if (!validPassword) return res.status(400).json({ message: "Incorrect password." });
      // create and assign a jwt
      const userInfoToSendBack = { _id: teacher._id, username: teacher.username, accType: teacher.accType };
      const token = jwt.sign(userInfoToSendBack, process.env.TOKEN_SECRET);
      res.status(200).json({ ...userInfoToSendBack, token });
    }
    if (student) {
      const validPassword = await bcrypt.compare(password, student.password);
      if (!validPassword) return res.status(400).json({ message: "Incorrect password." });
      // create and assign a jwt
      const userInfoToSendBack = { ...student._doc, password: undefined };
      const token = jwt.sign({ username: student.username, _id: student._id }, process.env.TOKEN_SECRET);
      res.status(200).json({ ...userInfoToSendBack, token });
    }
  } catch (error) {
    res.json(error);
  }
};

router.post("/register", registerFunc);
router.post("/login", loginFunc);

module.exports = router;
