const express = require("express");
const app = express();
require("dotenv/config");
// DB
const DB = require("./db/db");
// port
const PORT = process.env.PORT || 8080;
// User Model
require("./model/userModel");
// Otp Verication Model
require("./model/UserOtpVerification");
app.use(require("./routes/userRoutes"));
app.use(express.json());
// Test Route
app.get("/", function (req, res) {
  res.send("Hello World");
});

// app.listen(3000)

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
});
