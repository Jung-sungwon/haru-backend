const project = require("../models/project");
const calDetail = require("../models/calDetail");

exports.proDel = (req, res) => {
  const id = req.body.projectId;

  project.findOneAndDelete({ projectId: id }).then(() => {
    calDetail.deleteMany({ projectId: id }).then(() => {
      return res.status(200).json({ message: "삭제되었습니다." });
    });
  });
};
