const mongoose = require("mongoose");
const dbUrl =
  "mongodb+srv://clothxdevelopers:admin@clothx-backend.iorv36f.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.log("Error connecting to MongoDB");
  });

module.exports = mongoose;
