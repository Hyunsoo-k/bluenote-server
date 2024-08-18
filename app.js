const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const bbsRouter = require("./routes/bbs");
const authRouter = require("./routes/auth");

dotenv.config();
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("Connected to DB"));

const app = express();
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001", "https://bluenote-server.onrender.com"] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/bbs", bbsRouter);
app.use("/auth", authRouter);

app.listen(process.env.PORT || 3000, () => console.log("Server Started"));

