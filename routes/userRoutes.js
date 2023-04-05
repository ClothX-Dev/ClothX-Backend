const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const db = require("../db/db");
const bcrypt = require("bcrypt");

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
// signup/Create new User
// router.post("/user/register", (req, res) => {
//   User.findOne({ email: req.body.email })
//     .exec()
//     .then((users) => {
//       if (users.length >= 1) {
//         return res.status(409).json({ message: "Email Already exists" });
//       } else {
//         bcrypt.hash(req.body.password, 12, (err, hash) => {
//           if (err) {
//             res.status(500).json({ err: err });
//           } else {
//             const user = new User({
//               firstname: req.body.firstname,
//               lastname: req.body.lastname,
//               phone: req.body.phone,
//               email: req.body.email,
//               password: hash,
//             });
//             user
//               .save()
//               .then((result) => {
//                 res.status(201).json({ message: "User Created" });
//               })
//               .catch((err) => {
//                 res.status(500).json({ error: err });
//               });
//           }
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).send(err);
//     });
// });

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
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then((result) => {
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

module.exports = router;
