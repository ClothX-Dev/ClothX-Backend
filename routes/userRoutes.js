const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const OTP = require("../model/UserOtpVerification");
// const db = require("../db/db");
const bcrypt = require("bcrypt");
const secret = require("../secret.json");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

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
          // const otp = otpGenerator.generate(6, {
          //   // otp1: `{Math.floor(1000+ Math.random()*9000)}`,
          //   digits: true,
          //   alphabets: false,
          //   upperCase: false,
          //   specialChars: false,
          // });

          // const transporter = nodemailer.createTransport({
          //   service: "gmail",
          //   auth: {
          //     user: "clothxdevelopers@gmail.com",
          //     pass: "dvctunpmtjwpzyng",
          //   },
          // });

          // const mailOptions = {
          //   from: "clothdevelopers@​aol.com",
          //   to: req.body.email,
          //   subject: "Verify your email address",
          //   html: `<p>Thank you for choosing Dresset. <br>
          //   Use this OTP to complete your Sign Up procedure and verify your account on Dresset.<br>
          //   <br>
          //   Remember, Never share this OTP with anyone. <br>
          //   <b><i>${otp}</i><b>
          //   <br>
          //   <br>
          //   Regards,
          //   <br>
          //   Team Dresset</p> `,
          // };

          // otpVerification.save();

          user
            .save()
            .then((result) => {
              // sendVerificationEmail(result, res);
              // transporter.sendMail(mailOptions, (error, info) => {
              //   if (error) {
              //     console.log(error);
              //   } else {
              //     console.log("Email sent: " + info.response);
              //   }
              // });

              sendOTP(result, res);
              // res.status(201).json({ message: "User Created" });
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });

          // const hashedOTP = bcrypt.hash(otp, 12);
          // const otpVerification = new OTP({
          //   userId: req.params,
          //   otp: hashedOTP,
          //   createdAt: Date.now(),
          //   expiresAt: Date.now() + 36000,
          // });

          // otpVerification
          //   .save()
          //   .then((response) => {
          //     res.status(201).json({ message: "OTP Created" });
          //   })
          //   .catch((err) => {
          //     res.status(500).json({ message: "Error" });
          //   });
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
      const recordOTP = await sendOTP.find({
        userId,
      });
      if (recordOTP.length < 0) {
        throw new Error("Account doesn't Exists. Please Signup");
      } else {
        const { expiresAt } = recordOTP[0];
        const hashedOTP = recordOTP[0].otp;

        if (expiresAt < Date.now()) {
          await recordOTP.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            throw new Error("Invalid OTP");
          } else {
            await User.updateOne({ _id: userId }, { verified: true });
            await recordOTP.deleteMany({ _id: userId });
            res.json({
              status: "VERIFIED",
              message: `User Emal verified Successfully`,
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

//Verify Token
// router.get("/verify/:id/:token", async (req, res) => {
//   try {
//     const user = await User.findOne({ _id: req.params.id });
//     if (!user) return res.status(400).send("Invalid link");

//     const token = await Token.findOne({
//       userId: user._id,
//       token: req.params.token,
//     });
//     if (!token) return res.status(400).send("Invalid link");

//     await User.updateOne({ _id: user._id, verified: true });
//     await Token.findByIdAndRemove(token._id);

//     res.send("email verified sucessfully");
//   } catch (error) {
//     res.status(400).send("An error occured");
//   }
// });

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
// Verify OTP
router.post("/user/verfiyOTP", async (req, res) => {
  try {
    let { userID, otp } = req.body;
    if (!userID || !otp) {
      throw Error("Empty OTP Details are not allowed");
    } else {
      const OTPVerification = await otp.find({ userID });
      if (OTPVerification.length <= 0) {
        throw new Error("Account doesn't Exists,Please SignUp or Log in.");
      } else {
        const { expiresAt } = OTPVerification[0];
        const hashedOTP = OTPVerification[0].otp;
        if (expiresAt < Date.now()) {
          // user otp expired
          await OTPVerification.deleteMany({ userID });
          throw new Error("OTP has expired,Please request again!");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            // otp is wrong
            throw new Error("Invalid OTP, Please try again..");
          } else {
            // Sucess
            await User.updateOne({ _id: userID }, { verified: true });
            await OTPVerification.deleteMany(userID);
            res.json({
              Status: "success",
              message: "OTP Verification Successful",
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      Status: "Failed",
      Message: error.message,
    });
  }
});

// Password reset Api

// router.post("/user/forget", (req, res) => {
//   const { email } = req.body.email;
//   if (email != User.email) {
//     res.sendStatus(404).json({
//       message: "User not Found",
//     });
//   }
//   User.findOne({ email: email }, (err, user) => {});
// });
module.exports = router;
