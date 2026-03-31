const express = require("express");
const { getRecords } = require("../controllers/recordsController");

const router = express.Router();

router.get("/", getRecords);

module.exports = router;
