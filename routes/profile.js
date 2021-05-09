const router = require("express").Router();
const User = require("../models/User");
const passport = require("passport");

router.get("/test", (req, res) => {
  res.json({ msg: "test route work" });
});

router.get("/users",(req,res)=>{
  User.find().then((user)=>{
   return res.json(user);
  })
})
router.get("/orders",(req,res)=>{
  Order.find().then((user)=>{
   return res.json(user);
  })
})
router.get(
  "/",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      if (!user) {
        return res.status(404).json("user not registered");
      }
      return res.status(200).json(user);
    });
  }
);

router.get(
  "/docStatus",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      if (!user) {
        return res.status(404).json("user not registered");
      }
      return res.status(200).json({
        isPhoneVerified: user.isPhoneVerified,
        isDocSubmitted: user.isDocSubmitted,
        isDocVerified: user.isDocVerified,
        isSetupRequired: user.isSetupRequired,
      });
    });
  }
);

router.patch(
  "/update",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    const id = req.user.id;
    User.update({ _id: id }, { $set: req.body })
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "User Data Updated",
          request: {
            updatedData: req.body,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);

module.exports = router;
