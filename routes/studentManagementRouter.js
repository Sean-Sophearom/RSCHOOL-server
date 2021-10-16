const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Student = require("../schemas/Student");
const Chapter = require("../schemas/Chapter");
const verifyToken = require("./verifyToken");
const router = express.Router();

router.use(verifyToken);

const getAllStudentsFunc = async (req, res) => {
  try {
    const teacherUsername = req.user.username;
    const allStudents = await Student.find({ teacher: teacherUsername });
    const allStudentsWithoutPassword = allStudents.map((student) => ({ ...student._doc, password: undefined }));
    res.status(200).json(allStudentsWithoutPassword);
  } catch (error) {
    res.json(error);
  }
};

const createStudentFunc = async (req, res) => {
  try {
    // hashing password and checking if user already exists
    const teacherUsername = req.user.username;
    const { username, password, gender, email, phone } = req.body;
    const existingStudent1 = await Student.findOne({ phone });
    if (existingStudent1)
      return res.status(400).json({ message: `Student account with phone number ${phone} already exists.` });
    if (email) {
      const existingStudent2 = await Student.findOne({ email });
      if (existingStudent2)
        return res.status(400).json({ message: `Student account with email ${email} already exists.` });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const allChapters = await Chapter.find({ teacher: teacherUsername });
    //find the total number of questions in the course to calculate the progress later.
    let numOfQuestions = 0;
    allChapters.forEach((chapter) => {
      chapter.exercises.forEach((exercise) => {
        exercise.questions.forEach((exercise) => numOfQuestions++);
      });
    });

    const newStudent = new Student({
      numOfQuestions,
      username,
      gender,
      email,
      phone,
      test: null,
      password: hashedPassword,
      chapters: allChapters,
      teacher: teacherUsername,
    });
    const saved = await newStudent.save();
    saved.password = undefined;
    res.status(201).json(saved);
  } catch (error) {
    res.json(error);
  }
};

// placeholder for expansion
// const deleteStudentFunc = async (req, res) => {
//   const { _id } = req.body;
//   const deletedStudent = await Student.findByIdAndDelete(_id);
//   res.status(200).json(deletedStudent);
// };

const updateStudentFunc = async (req, res) => {
  try {
    const { _id } = req.user;
    const { chapterId, exercises, numOfDone, numOfCorrectlyDone } = req.body;
    const student = await Student.findById(_id);
    const updatedChapters = student.chapters.map((chapter) =>
      chapter._id.toString() === chapterId ? { ...chapter, exercises: exercises } : chapter
    );
    student.chapters = updatedChapters;
    student.numOfCorrectlyDone = numOfCorrectlyDone;
    student.numOfDone = numOfDone;
    await student.save();
    res.status(200).json({ ...student._doc, token: req.user.token });
  } catch (error) {
    res.json(error);
  }
};

router.route("/").get(getAllStudentsFunc).post(createStudentFunc).put(updateStudentFunc);

module.exports = router;
