const mongoose = require("mongoose");
const validator = require("validator");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 20,
  },
  lastname: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 20,
  },

  email: {
    type: String,
    required: true,
    unique: [true, "Email already exists"],
    validate(value) {
      if (!validator.isEmnail(value)) {
        throw new Error(`Invalid Email ${value}`);
      }
    },
  },
  phone: {
    type: Number,
    minlength: 10,
    maxlength: 10,
    required: true,
    unique: true,
  },
  //   password:{

  //   },
  state: {
    required: true,
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
});

// Model
const User = new mongoose.model(userDetails, UserSchema);
module.export = userDetails;
