const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
// const db = require("../db/db");
const bcrypt = require("bcrypt");
const secret = require("../../ClothX-Backend/secret.json");
const jwt = require("jsonwebtoken");

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
            // lastname: req.body.lastname,
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

// Login API
// router.post("/user/login", (req, res) => {
//   User.find({
//     email: req.body.email,
//   })
//     .exec({})
//     .then((users) => {
//       if (users.length() < 1) {
//         return res.sendStatus(404).json({
//           message: "Email does not exist",
//         });
//       }
//       bcrypt.compare(req.body.password, users[0].password, (err, result) => {
//         if (err) {
//           return res.status(401);
//         }
//         if (result) {
//           const token = jwt.sign(
//             {
//               email: users[0].email,
//               id: users[0]._id,
//             },
//             secret.key,
//             {
//               expiresIn: "24h",
//             }
//           );
//           return res.status(200).json({
//             message: "Auth successful",
//             token: token,
//           });
//         }
//         res.sendStatus(401);
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         Message: err,
//       });
//     });
// });
// router.post("/user/login", (req, res) => {
//   User.find({
//     email: req.body.email,
//   })
//     .exec({})
//     .then((users) => {
//       if (users.length() < 1) {
//         return res.sendStatus(404).json({
//           message: "Email does not exist",
//         });
//       }
//       bcrypt.compare(req.body.password, users[0].password, (err, result) => {
//         if (err) {
//           return res.status(401);
//         } else {
//           if (result) {
//             const token = jwt.sign(
//               {
//                 email: users[0].email,
//                 id: users[0]._id,
//               },
//               secret.key,
//               {
//                 expiresIn: "24h",
//               }
//             );
//             return res.status(200).json({
//               Message: "Auth Successful",
//               token: token,
//             });
//           }
//           res.sendStatus(401);
//         }
//       });
//     });
// });

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

module.exports = router;
