const express = require("express");
const { exportCsv } = require("../controllers/exportController");

const router = express.Router();

router.get("/csv", (req, res, next) => {
  req.params.resource = String(req.query.resource || "properties");
  next();
}, exportCsv);
router.get("/:resource", exportCsv);

module.exports = router;
