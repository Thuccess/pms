const express = require("express");
const { upload, uploadImage } = require("../controllers/uploadController");

const router = express.Router();

const runUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (!err) return next();
    if (err.name === "MulterError" && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 8MB." });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
};

router.post("/image", runUpload("image"), uploadImage);
router.post("/", runUpload("image"), uploadImage);
router.post("/file", runUpload("file"), uploadImage);

module.exports = router;
