const mongoose = require("mongoose");
const OTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    otp: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("OTP", OTPSchema);
