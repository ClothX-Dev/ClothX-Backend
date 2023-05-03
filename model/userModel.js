const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
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
      required: true,
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
      minlength: 8,
      trim: true,
      // lowercase: true,
      // uppercase: true,
      // maxlength: 30,
      alphanumerics: true,
    },
    state: {
      type: String,
      required: false,
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
    pincode: {
      type: Number,
      required: false,
    },
    // token: {
    //   required: false,
    //   type: String,
    // },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = mongoose.model("User", UserSchema);
