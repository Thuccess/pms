require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { startMongoWithRetry, isDbConnected } = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorHandler");
const seedDefaultUser = require("./utils/seedDefaultUser");

const authRoutes = require("./routes/authRoutes");
const propertiesRoutes = require("./routes/propertiesRoutes");
const unitsRoutes = require("./routes/unitsRoutes");
const tenantsRoutes = require("./routes/tenantsRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const exportRoutes = require("./routes/exportRoutes");
const recordsRoutes = require("./routes/recordsRoutes");
const { login, me, updateMe, changePassword } = require("./controllers/authController");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, dbConnected: isDbConnected() });
});

app.use("/api/auth", authRoutes);
app.post("/api/login", login);
app.get("/api/me", authMiddleware, me);
app.get("/api/profile", authMiddleware, me);
app.put("/api/profile", authMiddleware, updateMe);
app.put("/api/change-password", authMiddleware, changePassword);
app.post("/auth/login", login);
app.get("/auth/me", authMiddleware, me);
app.put("/auth/me", authMiddleware, updateMe);
app.put("/auth/change-password", authMiddleware, changePassword);
app.use("/api/properties", authMiddleware, propertiesRoutes);
app.use("/api/units", authMiddleware, unitsRoutes);
app.use("/api/tenants", authMiddleware, tenantsRoutes);
app.use("/api/payments", authMiddleware, paymentsRoutes);
app.use("/api/maintenance", authMiddleware, maintenanceRoutes);
app.use("/api/upload", authMiddleware, uploadRoutes);
app.use("/api/export", authMiddleware, exportRoutes);
app.use("/api/records", authMiddleware, recordsRoutes);

app.use(errorHandler);

const start = async () => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    startMongoWithRetry({
      onConnected: seedDefaultUser,
    });
  });
};

start().catch((error) => {
  console.error("Server failed to start", error);
  process.exit(1);
});
