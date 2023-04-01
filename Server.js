const express = require("express");
const app = express();
const DB = require('./db/db');

const PORT = 3000;

app.get("/", function (req, res) {
  res.send("Hello World");
});

// app.listen(3000)

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
});
