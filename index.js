const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const api = require("./router/api");
const info = require("./router/info");
const crudrouter = require("./router/crudRouter");
const cookieParser = require("cookie-parser");

require("dotenv").config();

app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.json());
app.use(cors({ origin: process.env.FRONT_URL, credentials: true }));
app.use("/api", api);
app.use("/info", info);
app.use("/crudRouter", crudrouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

main()
  .then(() => {
    console.log("mongoDB에 연결되었습니다.");
  })
  .catch((err) => console.log(err));

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`${port}번 port에 서버가 연결되었습니다.`);
});
