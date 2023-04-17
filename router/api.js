const express = require("express");
const {
  signup,
  active,
  activeAccount,
  signin,
  signcheck,
  logout,
} = require("../controller/sign");

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.get("/signcheck", signcheck);

router.get("/logout", logout);

router.post("/active", active);

router.post("/activeAccount", activeAccount);

module.exports = router;
