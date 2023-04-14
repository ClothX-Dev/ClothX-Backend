const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
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
          const otp = otpGenerator.generate(6, {
            digits: true,
            alphabets: false,
            upperCase: false,
            specialChars: false,
          });
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: 'clothxdevelopers@gmail.com',
              pass: 'dvctunpmtjwpzyng'
            },
          });
          // const transporter = nodemailer.createTransport({
          //   host: "smtp.mail.yahoo.com",
          //   port: 465,
          //   secure: true,
          //   auth: {
          //     user: "clothdevelopers@​aol.com",
          //     pass: "DEVELOPERS2024@a",
          //   },
          //   // tls: {
          //   //   ciphers: "SSLv3",
          //   // },
          // });

          const mailOptions = {
            from: "clothdevelopers@​aol.com",
            to: req.body.email,
            subject: "Verify your email address",
            text: `<p>Enter <b>${otp} </b>in the App to verify your email address  and complete the Authentication.</p> <br>
            <p>This code will <b>Expires</b> in 5 Minutes.</p> `,
          };
          user
            .save()
            .then((result) => {
              // sendVerificationEmail(result, res);
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  res.status(500).send("Failed to send OTP");
                } else {
                  console.log("Email sent: " + info.response);

                  // Save the OTP and user details in a database or session
                  // req.session = { name, email, otp };
                  res.status(200).send("OTP sent successfully");
                }
              });
              res.status(201).json({ message: "User Created" });
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        }
      });
    }
  });
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
  // console.log(req.params.id);
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

// Send Email Verification
// const sendVerificationEmail = async ({ id, email }, res) => {
//   try {
//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
//     // Mail Options
//     const mailOptions = {
//       from: "bhaveshgarg2004@gmail.com",
//       to: email,
//       subject: "Email Verification",
//       html: `<p>Enter <b>${otp} </b>in the App to verify your email address  and complete the Authentication.</p> <br>
//      <p>This code will <b>Expires</b> in 5 Minutes.</p> `,
//     };
//     // Hash OTP
//     // const saltRound = 12;
//     const hashedOTP = await bcrypt.hash(otp, 12);
//     const newOTPVerification = new UserOTPVerification({
//       userId: _id,
//       otp: hashedOTP,
//       email: email,
//       createdAt: new Date(),
//       // expiresAt: new Date() + 360,
//     });
//     // Save OTP Record
//     newOTPVerification.save();
//     // transporter.sendMail(mailOptions).
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         return console.log(error);
//       }
//       console.log("Message sent: " + info.response);
//     });
//     // res.json({
//     //   Status: "Pending",
//     //   Message: "Verification Email sent successfully",
//     //   data: {
//     //     userID: _id,
//     //     email,
//     //   },
//     // });
//   } catch (error) {
//     res.json({
//       Status: "Failed",
//       Message: error,
//     });
//   }
// };

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
