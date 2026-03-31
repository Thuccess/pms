const path = require("path");
const fs = require("fs");
const multer = require("multer");
const asyncHandler = require("../utils/asyncHandler");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif"];
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimeIsImage = (file.mimetype || "").startsWith("image/");
  if (!mimeIsImage && !allowedExtensions.includes(ext)) {
    return cb(new Error("Unsupported file format"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const base = `${req.protocol}://${req.get("host")}`;
  const url = `${base}/uploads/${req.file.filename}`;
  return res.status(201).json({ url, filename: req.file.filename });
});

module.exports = { upload, uploadImage };
