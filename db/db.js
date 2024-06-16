const mongoose = require("mongoose");
const dbUrl = process.env.MONGODB_URL_LOCAL;
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.log("Error connecting to MongoDB");
  });

module.exports = mongoose;
