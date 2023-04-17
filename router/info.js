const express = require("express");
const {
  myinfo,
  createproject,
  getproject,
  selectproject,
  userNameUpdate,
  projectDetail,
  projectPeriod,
  calendarDetail,
  calendarDetailEdit,
  getCalendarDetail,
  gauge,
} = require("../controller/userInfo");

const router = express.Router();

router.get("/myinfo", myinfo);

router.get("/gauge", gauge);

router.get("/projectDetail", projectDetail);

router.get("/getproject", getproject);

router.get("/projectPeriod", projectPeriod);

router.get("/getCalendarDetail", getCalendarDetail);

router.post("/calendarDetail", calendarDetail);

router.patch("/calendarDetailEdit", calendarDetailEdit);

router.post("/createproject", createproject);

router.post("/selectproject", selectproject);

router.patch("/userNameUpdate", userNameUpdate);

module.exports = router;
