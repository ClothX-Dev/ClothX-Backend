const mongoose = require("mongoose");
const validator = require("validator");
const db = require("../db/db");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      minlength: 5,
      maxlength: 20,
    },
    phone: {
      type: Number,
      minlength: 10,
      maxlength: 10,
      required: false,
      unique: true,
    },
    email: {
      type: String,
      required: false,
      unique: [true, "Email already exists"],
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error(`Invalid Email ${value}`);
        }
      },
    },

    password: {
      type: String,
      required: true,
    },
    state: {
      required: false,
      type: String,
    },
    city: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    landmark: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Model
// const User = db.model("User", UserSchema);
// module.export = User;

module.exports = mongoose.model("User", UserSchema);
