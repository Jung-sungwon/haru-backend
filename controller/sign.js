const jwt = require("jsonwebtoken");
const mailer = require("../helper/mailer");
const User = require("../models/user");

exports.signup = (req, res) => {
  const data = req.body;

  const { email, name } = data;

  User.findOne({ email }).then((data) => {
    if (data) {
      return res.status(400).json({ error: "이미 가입된 유저입니다." });
    } else {
      let token = jwt.sign({ email, name }, process.env.PRIVATE_KEY, {
        expiresIn: 60 * 10,
      });

      let info = {
        from: '"하루단련" <하루단련@example.com>',
        to: email,
        subject: "[하루단련] 가입 인증메일 입니다.",
        html: `<b>  
    <h4>아래 링크를 클릭하여 10분내에 가입을 진행해주세요. </h4>
    <hr/>
    <div>${process.env.DISTRIBUTION_URL + "/user/active/" + token}</div>
    </b>`,
      };

      if (!email) {
        return res.status(400).json({ error: "나중에 다시 시도해 주세요." });
      }

      mailer(info)
        .then(() => {
          console.log("메일을 성공적으로 보냄");
        })
        .catch((e) => {
          console.log("mailer Err : ", e);
        });

      return res.status(200).json({ message: "인증메일을 보냈습니다." });
    }
  });
};

exports.active = (req, res) => {
  const token = req.body.indexToken;

  jwt.verify(token, process.env.PRIVATE_KEY, (err, data) => {
    if (err) {
      return res.status(400).json({ error: "만료된 토큰" });
    }
    const { email, name } = data;

    return res.status(200).json({ email, name });
  });
};

exports.activeAccount = (req, res) => {
  const data = req.body;
  const { pw, user } = data;
  const { name, email } = user;

  User.findOne({ email })
    .then((response) => {
      console.log("가입 res : ", response);

      const client = new User({ name, email, password: pw });
      client
        .save()
        .then(() => {
          console.log("가입완료");
          return res
            .status(200)
            .json({ message: "가입되었습니다. 로그인을 해주세요." });
        })
        .catch((e) => {
          console.log("가입에러 : ", e);
        });
    })
    .catch((e) => {
      console.log("가입 err : ", e);
    });
};

exports.signin = (req, res) => {
  const data = req.body;

  const { email, password } = data;
  User.findOne({ email }).then((user) => {
    const { name, email, role } = user;

    let tok = jwt.sign({ email, name, role }, process.env.PRIVATE_KEY);

    if (user.checkPassword(password)) {
      res.cookie("token", tok, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "none",
        secure: true,
      });
      return res.status(200).json({ message: "로그인 되었습니다." });
    } else {
      return res.status(400).json({ message: "비밀번호가 틀렸습니다." });
    }
  });
};

exports.signcheck = (req, res) => {
  const token = req.cookies.token;

  if (token) {
    let tokenDetail = jwt.decode(token);
    const { email, role, name } = tokenDetail;

    return res.status(200).json({ email, role, name });
  } else {
    return res.status(200).json({ error: false });
  }
};

exports.logout = (req, res) => {
  const token = req.cookies.token;

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("proCookie", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  if (token) {
    return res.status(200).json({ message: "로그아웃 되었습니다." });
  } else {
    return res.status(400).json({ error: "잘못된 접근입니다." });
  }
};
