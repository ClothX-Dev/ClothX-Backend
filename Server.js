const express = require("express");
const app = express();
// DB
const DB = require("./db/db");
// port
const PORT = 8080;
require("./model/userModel");
app.use(require("./routes/userRoutes"));
app.use(express.json());
// Test Route
app.get("/", function (req, res) {
  res.send("Hello Bhavesh");
});

// app.listen(3000)

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
});
