const express = require("express");
const verifyToken = require("./verifyToken");
const Chapter = require("../schemas/Chapter");

const router = express.Router();
router.use(verifyToken);

router.get("/", async (req, res) => {
  try {
    const teacherUsername = req.user.username;
    const allChapters = await Chapter.find({ teacher: teacherUsername });
    res.status(200).json(allChapters);
  } catch (error) {
    res.json(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const teacherUsername = req.user.username;
    const newChapter = new Chapter({ ...req.body, teacher: teacherUsername });
    await newChapter.save();
    res.status(200).json(newChapter);
  } catch (error) {
    res.json(error);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedChapter);
  } catch (error) {
    res.json(error);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedChapter = await Chapter.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedChapter);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
