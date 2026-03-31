const express = require("express");
const { login, me, updateMe, changePassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateMe);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
