const express = require("express");

const { proDel } = require("../controller/crud");

const router = express.Router();

router.delete("/proDel", proDel);

module.exports = router;
