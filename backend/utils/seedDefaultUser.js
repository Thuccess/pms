const bcrypt = require("bcryptjs");
const User = require("../models/User");

const DEFAULT_EMAIL = "info@luxorld.com";
const DEFAULT_PASSWORD = "12345678";

const seedDefaultUser = async () => {
  const existing = await User.findOne({ email: DEFAULT_EMAIL });
  if (existing) return;

  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  await User.create({
    name: "Luxorld Admin",
    email: DEFAULT_EMAIL,
    password: hashed,
    avatar: "",
  });
  console.log("Default user seeded: info@luxorld.com");
};

module.exports = seedDefaultUser;
