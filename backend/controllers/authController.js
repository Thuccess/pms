const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const userId = String(user._id);
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    success: true,
    token,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists && String(exists._id) !== String(user._id)) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user.email = email;
  }

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }
  if (typeof avatar === "string") {
    user.avatar = avatar;
  }
  if (typeof password === "string" && password.length > 0) {
    user.password = await bcrypt.hash(password, 10);
  }

  await user.save();

  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!strongPassword.test(newPassword)) {
    return res.status(400).json({
      message: "New password must be at least 8 characters and include uppercase, lowercase, and a number",
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ message: "Password updated successfully" });
});

module.exports = { login, me, updateMe, changePassword };
