const jwt = require("jsonwebtoken");
const Project = require("../models/project");
const User = require("../models/user");
const calDetail = require("../models/calDetail");
const { nanoid } = require("nanoid");

exports.myinfo = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({ error: "토큰 없음" });
  }

  const decode = jwt.decode(token);

  const { email, name } = decode;

  return res.status(200).json({ email, name });
};

exports.createproject = (req, res) => {
  const projectData = req.body.data;

  const token = req.cookies.token;

  const decode = jwt.decode(token);

  const { title, period, purpose } = projectData;

  const { email, name } = decode;
  //
  const today = new Date();

  //const startDate = today.toISOString().slice(0, 10);

  const startDate = new Date(today)
    .toLocaleDateString("ko-KR")
    .replaceAll(". ", "-")
    .replaceAll(".", "");

  const enday = new Date(startDate);

  enday.setDate(enday.getDate() + (period - 1));

  // const endDate = enday.toISOString().slice(0, 10);
  const endDate = enday
    .toLocaleDateString("ko-KR")
    .replaceAll(". ", "-")
    .replaceAll(".", "");

  const periodArr = [startDate, endDate, period];

  //

  User.findOne({ email }).then((user) => {
    const { _id } = user;

    const userId = _id.toString();

    const projectId = nanoid();

    const newPlan = new Project({
      title,
      period: periodArr,
      purpose,
      userId,
      projectId,
    });

    newPlan
      .save()
      .then(() => {
        return res.status(200).json({ message: "프로젝트가 생성되었습니다!" });
      })
      .catch((e) => {
        return res.status(400).json({ error: "나중에 다시 시도해주세요." });
      });
  });
};

exports.getproject = (req, res) => {
  const token = req.cookies.token;

  const decode = jwt.decode(token);

  const { email, name } = decode;

  User.findOne({ email }).then((user) => {
    const { _id } = user;

    const userId = _id.toString();

    Project.find({ userId }).then((data) => {
      let dataArr = [];
      data.map((item) => {
        const { title, projectId, period } = item;
        dataArr.push({ title, projectId, period });
      });

      return res.status(200).json(dataArr);
    });
  });
};

exports.selectproject = (req, res) => {
  const proData = req.body;

  const { title, projectId, period } = proData;

  const proCookie = jwt.sign(
    { title, projectId, period },
    process.env.PRIVATE_KEY
  );

  res.cookie("proCookie", proCookie);

  return res.status(200).json({ message: `${title} 이 선택되었습니다.` });
};

exports.userNameUpdate = (req, res) => {
  const nameData = req.body;

  const token = req.cookies.token;

  const decode = jwt.decode(token);

  const { email, name: oldName, role } = decode;

  const { name } = nameData;

  User.findOneAndUpdate({ email }, { name }, { new: true })
    .then((response) => {
      const updateToken = jwt.sign(
        { email, name, role },
        process.env.PRIVATE_KEY
      );
      res.cookie("token", updateToken, { maxAge: 1000 * 60 * 60 * 24 * 7 });
      return res.status(200).json({ message: "수정 완료" });
    })
    .catch((e) => {
      console.log("update err : ", e);
    });
};

exports.projectDetail = (req, res) => {
  const id = req.query.id;

  Project.findOne({ projectId: id }).then((data) => {
    const { title, period, purpose } = data;

    return res.status(200).json({ title, period, purpose });
  });
};

exports.projectPeriod = (req, res) => {
  const proCookie = req.cookies.proCookie;

  const decode = jwt.decode(proCookie);

  try {
    const { period, title, projectId } = decode;

    //const startDate = new Date(period[0]).toISOString().slice(0, 10);
    const startDate = new Date(period[0])
      .toLocaleDateString("ko-KR")
      .replaceAll(". ", "-")
      .replaceAll(".", "");

    let dateArr = [startDate];

    for (let i = 1; i < parseInt(period[2]); i++) {
      const calDate = new Date(period[0]);

      calDate.setDate(calDate.getDate() + i);
      //const calresult = calDate.toISOString().slice(0, 10);
      const calresult = calDate
        .toLocaleDateString("ko-KR")
        .replaceAll(". ", "-")
        .replaceAll(".", "");
      dateArr.push(calresult);
    }

    return res.status(200).json({ dateArr, projectId, title });
  } catch {
    return res.status(200).json({ message: "hello" });
  }
};

exports.calendarDetail = (req, res) => {
  const data = req.body;

  const { props, day } = data;

  const { idx, project, period } = props;

  const { detail, hour, min } = day;

  calDetail.find({ projectId: project }).then((detailData) => {
    const projectArr = [];
    detailData.map((item) => {
      projectArr.push(item.day);
    });

    if (!projectArr.includes(parseInt(idx))) {
      const detailSave = new calDetail({
        detail,
        hour,
        min,
        period,
        day: idx,
        projectId: project,
        check: true,
      });

      detailSave
        .save()
        .then(() => {
          return res.status(200).json({ message: "데이터가 저장되었습니다." });
        })
        .catch(() => {
          return res.status(400).json({ error: "나중에 다시 시도해주세요." });
        });
    } else {
      return res
        .status(200)
        .json({ message: "이미 저장된 데이터입니다. Edit을 클릭해주세요." });
    }
  });
};

exports.calendarDetailEdit = (req, res) => {
  const data = req.body;

  const { props, day } = data;

  const { idx, project, period } = props;

  const { detail, hour, min } = day;

  calDetail
    .findOneAndUpdate(
      { projectId: project, day: idx },
      { detail, hour, min, period, day: idx, projectId: project },
      { new: true }
    )
    .then((detailData) => {
      if (detailData === null) {
        return res
          .status(200)
          .json({ message: "내용을 입력후 YES 버튼을 눌러 저장해주세요." });
      } else {
        return res.status(200).json({ message: "수정 완료." });
      }
    })
    .catch((e) => {
      return res.status(400).json({ error: "나중에 다시 시도해주세요." });
    });
};

exports.getCalendarDetail = (req, res) => {
  const data = req.query;

  const { idx, project, period } = data;

  calDetail.findOne({ projectId: project, day: idx }).then((selectData) => {
    try {
      const { detail, hour, min } = selectData;

      return res.status(200).json({ detail, hour, min });
    } catch {}
  });
};

exports.gauge = (req, res) => {
  const data = req.query;

  const { project, period } = data;

  let chechNum = 0;

  calDetail.find({ projectId: project }).then((selectData) => {
    console.log("data 55: ", selectData);
    selectData.map((item) => {
      if (item.check) {
        chechNum = chechNum + 1;
      }
    });

    return res.status(200).json({ num: chechNum });
  });
};

//마이페이지 프로젝트 리스트에서 프로젝트를 삭제할때
//해당 프로젝트를 삭제하면 같은 프로젝트id를 공유하는 디테일 페이지 정보도 모두 삭제해야한다.
