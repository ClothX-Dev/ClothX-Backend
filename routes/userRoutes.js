const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const OTP = require("../model/UserOtpVerification");
// const db = require("../db/db");
const bcrypt = require("bcrypt");
const secret = require("../secret.json");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// const otpGenerator = require("otp-generator");

router.use(express.json());

// Get all Users
router.get("/user/get", (req, res) => {
  User.find({})
    .exec()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});
// Signup API
router.post("/user/register", (req, res) => {
  User.findOne({ email: req.body.email }).then((result) => {
    if (result) {
      return res.status(409).json({ message: "Email Already exists" });
    } else {
      bcrypt.hash(req.body.password, 12, (err, hash) => {
        if (err) {
          res.status(500).json({ err: err });
        } else {
          const user = new User({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            password: hash,
            verified: false,
          });
          user
            .save()
            .then((result) => {
              sendOTP(result, res);
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        }
      });
    }
  });
});

const sendOTP = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: "clothdevelopers@​aol.com",
      to: email,
      subject: "Verify your email address",
      html: `<p>Thank you for choosing Dresset. <br>
      Use this OTP to complete your Sign Up procedure and verify your account on Dresset.<br>
      <br>
      Remember, Never share this OTP with anyone. <br>
      <b><i>${otp}</i><b>
      <br>
      <br>
      Regards,
      <br>
      Team Dresset</p> `,
    };
    const hashedOTP = await bcrypt.hash(otp, 12);
    const newOTP = new OTP({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    // otp save
    await newOTP.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "clothxdevelopers@gmail.com",
        pass: "dvctunpmtjwpzyng",
      },
    });
    // transporter.sendMail(mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    res.json({
      status: "PENDING",
      message: "Verification OTP email sent",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (err) {
    res.json({
      status: "PENDING",
      message: err.message,
    });
  }
};

// Verify OTP

router.post("/user/verifyOTP", async (req, res) => {
  try {
    let { userId, otp } = req.body;

    if (!userId || !otp) {
      throw Error("Empty OTP are not Allowed");
    } else {
      const recordOTP = await OTP.find({
        userId,
      });

      if (recordOTP.length < 0) {
        throw new Error(
          "Account doesn't exists or already been verified. Please Signup"
        );
      } else {
        const { expiresAt } = recordOTP[0];
        const hashedOTP = recordOTP[0].otp;

        if (expiresAt < Date.now()) {
          await OTP.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            throw new Error("Invalid OTP");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await OTP.deleteMany({ _id: userId });
            res.json({
              status: "VERIFIED",
              message: `User Email verified Successfully`,
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

// Login API
router.post("/user/login", (req, res) => {
  User.find({
    email: req.body.email,
  })
    .exec()
    .then((users) => {
      if (users.length < 1) {
        return res.sendStatus(404).json({
          message: "User not found",
        });
      }
      bcrypt.compare(req.body.password, users[0].password, (err, result) => {
        if (err) {
          return res.status(401);
        }
        if (result) {
          // CREATE TOKEN
          const token = jwt.sign(
            {
              email: users[0].email,
              id: users[0]._id,
            },
            secret.key,
            {
              expiresIn: "24h",
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        res.sendStatus(401);
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

// Edit profile API
router.patch("/user/edit/:id", (req, res, next) => {
  User.findOneAndUpdate(
    { id: req.params._id },
    {
      $set: {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        state: req.body.state,
        city: req.body.city,
        address: req.body.address,
        landmark: req.body.landmark,
        pincode: req.body.pincode,
      },
    }
  )
    .then((result) => {
      res.status(200).json({
        message: result,
      });
    })
    .catch((err) => {
      // console.log(err);
      res.status(500).json({
        Error: err,
      });
    });
});

// Resend Verification Code

router.post("/user/resendOTP", async (req, res) => {
  try {
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error("Empty user details are not allowed");
    } else {
      await OTP.deleteMany({ userId });
      sendOTP({ _id: userId, email }, res);
    }
  } catch (err) {
    res.json({
      status: "FAILED",
      message: err.message,
    });
  }
});

// Password reset Api
router.post("/user/forgetpassword", async (req, res) => {
  try {
    const data = User.findOne({ email: req.body.email });
    if (data) {
      
    } else {
      res.status(200).send({ success: true, message: "Email doesn't exists." });
    }
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
  // const { email } = req.body.email;
  // if (email != User.email) {
  //   res.sendStatus(404).json({
  //     message: "User not Found",
  //   });
  // }
  // User.findOne({ email: email }, (err, user) => {});
});
module.exports = router;
