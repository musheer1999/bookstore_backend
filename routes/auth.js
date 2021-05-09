const router = require("express").Router();
const User = require("../models/User");
const Product = require("../models/Products");
const gravatar = require("gravatar");
var _ = require("lodash");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const passport = require("passport");
const keys = require("../config/keys");
const validateSetupInput = require("../validation/setup");
var AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
var springedge = require("springedge");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
function phonenumber(inputtxt) {
  var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (inputtxt.match(phoneno)) {
    return true;
  } else {
    console.log("message");
    return false;
  }
}

router.post("/register", (req, res) => {
  console.log("register entered")
  let errors = {};
  errors.phoneNo = "please enter a valid phone number";
  var number = req.body.phoneNo;
  if (_.isEmpty(number)) {
    return res.status(400).json(errors);
  }
  if (phonenumber(number) != true) {
    return res.status(400).json(errors);
  }
  User.findOne({ phoneNo: req.body.phoneNo }).then((user) => {
    if (user) {
      user.OTP = Math.floor(Math.random() * 900000) + 100000;
      console.log(user.OTP)

 
 


      user.save();
    
return res.json(user);
    
    } else {
     
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm", // Default
      });
      const newUser = new User({
        avatar,
        phoneNo: req.body.phoneNo,
        isPhoneVerified: true,
      });

      response = {
        success: true,
        user: newUser,
      };
      newUser.save().then((users) => {
        users.OTP = Math.floor(Math.random() * 900000) + 100000;
        console.log("the new reg : "+users.OTP);
      
        users.save();
        return res.json(users);
      }).catch((err)=>{
     console.log(err);
        res.json(err)
      });
    }
  });
});

router.post("/otpvalidation", (req, res) => {
  
  let errors = {};
  if (_.isEmpty(req.body.OTP)) {
    errors.OTP = "OTP is not valid";
    return res.status(400).json(errors);
  }
  User.findOne({ phoneNo: req.body.phoneNo }).then((user) => {
   
   
      // user.OTP
      const payload = {
        id: user.id,
        phoneNo: user.phoneNo,
        avatar: user.avatar,
        isDocVerified: user.isDocVerified,
      };
      jwt.sign(
        payload,
        keys.secretOrKey,
        //          { expiresIn: 36000 },
        (err, token) => {
          res.json({
            success: true,
            userId: user.id,
            isSetupRequired: user.isSetupRequired,
            isDocVerified: user.isDocVerified,
            token: "Bearer " + token,
          });
        }
      );
   
  
  });
});



router.post(
  "/verifyNumber",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    // console.log(req.body.oldPhoneNo)
    // console.log("nkjnjh")
    let errors = {};
    var number = req.body.phoneNo;
    // console.log(number)
    if (_.isEmpty(number)) {
      console.log("Empty Number");
      errors.phoneNo = "please enter a valid phone number";
      return res.status(400).json(errors);
    }
    if (phonenumber(number) != true) {
      console.log("Not a Number");
      errors.phoneNo = "please enter a valid phone number";
      return res.status(400).json(errors);
    }
    User.findById(req.user.id).then((user) => {
      if (number === user.phoneNo) {
        console.log("Correct Number");

        user.OTP = Math.floor(Math.random() * 900000) + 100000;
        // user.OTP = 111111;
        user.save();
       

        console.log("the otp is :"+user.OTP);
        res.end(JSON.stringify({ MessageID: "Check Your Phone" }));
      } else {
        console.log("Wrong Number with this Account");
        errors.phoneNo =
          "This Phone Number is not associated with this account";
        return res.status(400).json(errors);
      }
    });
  }
);

router.post(
  "/addNewNumber",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    // console.log(req.body.oldPhoneNo)
    // console.log("nkjnjh")
    var errors = {};
    //errors.phoneNo = "please enter a valid phone number";
    var number = req.body.phoneNo;
    // console.log(number)
    if (_.isEmpty(number)) {
      console.log("Empty Number");
      //errors="Empty Number";
      errors.phoneNo = "please enter a valid phone number";
      return res.status(400).json(errors);
    }
    if (phonenumber(number) != true) {
      console.log("Not a Number");
      errors.phoneNo = "please enter a valid phone number";
      return res.status(400).json(errors);
    }

    User.findOne({ phoneNo: req.body.phoneNo }).then((user) => {
      if (user) {
        console.log("This Phone Number is already registered");
        errors.phoneNo = "This Phone Number is already registered";
        // error.phoneNo="This Phone Number is already registered";
        return res.status(400).json(errors);
      }
    });
    User.findById(req.user.id).then((user) => {
      user.OTP = Math.floor(Math.random() * 900000) + 100000;
      // user.OTP = 111111;
      user.save();
      // var params = {
      //   Message:
      //     "Your Ucliq verification code is " +
      //     user.OTP +
      //     ". Please do not disclose it.",
      //   //PhoneNumber: "+15014380798",
      //   PhoneNumber: "+91" + req.body.phoneNo,
      //   MessageAttributes: {
      //     "AWS.SNS.SMS.SenderID": {
      //       DataType: "String",
      //       StringValue: "ucliq",
      //     },
      //   },
      // };

      // var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
      //   .publish(params)
      //   .promise();

      // publishTextPromise
      //   .then(function (data) {
      //     res.end(JSON.stringify({ phoneNo: number }));
      //   })
      //   .catch(function (err) {
      //     res.end(JSON.stringify({ Error: err }));
      //   });
      console.log(user.OTP);
      res.end(JSON.stringify({ phoneNo: number }));
    });
  }
);

router.post(
  "/verifyOTP",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    let errors = {};
    if (_.isEmpty(req.body.OTP)) {
      errors.OTP = "OTP is not valid";
      return res.status(400).json(errors);
    }
    console.log("verifyOTP");
    User.findById(req.user.id).then((user) => {
      if (req.body.OTP == user.OTP) {
        const payload = {
          id: user.id,
          phoneNo: user.phoneNo,
          avatar: user.avatar,
        };
        jwt.sign(
          payload,
          keys.secretOrKey,
          //          { expiresIn: 36000 },
          (err, token) => {
            res.json({
              success: true,
              userId: user.id,
              isSetupRequired: user.isSetupRequired,
              isDocVerified: user.isDocVerified,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.OTP = "OTP is not valid";
        return res.status(400).json(errors);
      }
    });
  }
);

router.post(
  "/verifyNewNumberOTP",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    let errors = {};
    console.log(req.body.phoneNo);
    if (_.isEmpty(req.body.OTP)) {
      errors.OTP = "OTP is not valid";
      return res.status(400).json(errors);
    }
    console.log("verifyOTP");
    User.findById(req.user.id).then((user) => {
      if (req.body.OTP == user.OTP) {
        user.phoneNo = req.body.phoneNo;
        user.save();
        const payload = {
          id: user.id,
          phoneNo: user.phoneNo,
          avatar: user.avatar,
        };
        jwt.sign(
          payload,
          keys.secretOrKey,
          //          { expiresIn: 36000 },
          (err, token) => {
            res.json({
              success: true,
              userId: user.id,
              isSetupRequired: user.isSetupRequired,
              isDocVerified: user.isDocVerified,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.OTP = "OTP is not valid";
        return res.status(400).json(errors);
      }
    });
  }
);

router.get(
  "/profile",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    // has hard coded phone no for now

    // User.findOne({ phoneNo: "1122334455" }).then((user) => {
    //   if (!user) {
    //     return res.status(404).json("user not found!");
    //   }
    // return res.status(200).json({ user });
    User.findById(req.user.id)
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((err) => {
        console.log(err);
      });
    // });
  }
);
 router.get("/get_user/:phoneNo",(req,res)=>{
   User.find({ phoneNo: req.params.phoneNo}).then((user)=>{
     return res.status(200).json(user);
   }).catch((err)=>{
     return res.json(404)
   })
 })
// router.get('/dashboard', passport.authenticate("user-strategy", { session: false }), (req, res) => {
//   User.findById(req.user.id).then((user) => {
//     return res.status(200).json(user)
//   }).catch((err) => {
//     console.log(err);
//   })
// });

router.post(
  "/adduserdetails",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(req.user.id, {
      name: req.body.name,
      business: req.body.business,
      pinCode: req.body.pincode,
    })
      .then(() => {
        // result
      })
      .catch(() => {
        // err
      });
  }
);

router.post(
  "/updatedetails",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    console.log(req.body.type);
    if (req.body.type == "name") {
      var updatedDetail = { name: req.body.name };
      User.findByIdAndUpdate(req.user.id, updatedDetail)
        .then(() => {
          res.status(200).json({ msg: "updated" });
        })
        .catch(() => {
          res.status(404).json({ msg: "not found" });
        });
    } else if (req.body.type == "gstin") {
      var updatedDetail = { taxDetails: req.body.gstin };
      User.findByIdAndUpdate(req.user.id, updatedDetail)
        .then(() => {
          res.status(200).json({ msg: "updated" });
        })
        .catch(() => {
          res.status(404).json({ msg: "not found" });
        });
    } else if (req.body.type == "bankdetails") {
      console.log("inside BankDetails");
      var updatedDetail = { bankDetails: req.body.bankDetails };
      User.findByIdAndUpdate(req.user.id, updatedDetail)
        .then(() => {
          res.status(200).json({ msg: "updated" });
        })
        .catch(() => {
          res.status(404).json({ msg: "not found" });
        });
    }
  }
);

router.patch(
  "/update",
  //passport.authenticate("user-strategy", { session: false }),
  (req, res, next) => {
    const { error } = UpdateSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
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

router.post(
  "/setup",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateSetupInput(req.body);

    if (!isValid) {
      //  console.log("something is wrong here");
      return res.status(400).json(errors);
    }

    User.findById(req.user.id)
      .then((user) => {
        user.name = req.body.name;
        user.pinCode = req.body.pincode;
        user.companyName = req.body.companyName;
        user.isSetupRequired = false;
        user.save();
        // .then((user) => {
        res.status(200).json({ success: "true" });
        // })
      })
      .catch((err) => res.status(500).json(err));
  }
);

//only for testing purpose
router.get("/all", (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      const response = {
        count: users.length,
        users: users,
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get(
  "/status",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      return res.status(200).json({
        isDocVerified: user.isDocVerified,
        isDocSubmitted: user.isDocSubmitted,
      });
    });
  }
);

router.get("/otp/:phone", (req, res) => {
  User.find({ phoneNo: req.params.phone }).then((user) => {
    if (user[0]) {
      return res.status(200).json(user[0].OTP);
    } else {
      return res.status(404).json("user not found!");
    }
  });
});

//only for testing
router.get("/user/:phone", (req, res) => {
  User.find({ phoneNo: req.params.phone }).then((user) => {
    if (user[0]) {
      return res.status(200).json(user[0]);
    } else {
      return res.status(404).json("user not found!");
    }
  });
});

//used
router.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email:email }).then((user) => {

 if(!user){
  return res.status(400).json("User NOt found  please signup");
 }
 else{ bcrypt.compare(password, user.password).then((isMatch) => {
    if (isMatch) {
    
      const payload = {
        id: user.id,
        avatar: user.avatar,
        isDocVerified: user.isDocVerified,
        };
        jwt.sign(
        payload,
        keys.secretOrKey,
        // { expiresIn: 36000 },
        (err, token) => {
          console.log(token)
        res.json({
        success: true,
        userId: user.id,
        isSetupRequired: user.isSetupRequired,
        isDocVerified: user.isDocVerified,
        token: "Bearer " + token,
        });
        }
        );
    } else {
    
      return res.status(400).json("Incorrect password");
    }
  });}






  });
 
  });

  //used
router.post("/user/signup",(req,res)=>{

User.findOne({email:req.body.email}).then((user)=>{

  if(user){
        return res.json("email already exists")
  }else{
    const user = new User({
      email:req.body.email,
      password:req.body.password,
      name:"musheer ahmad",
      pinCode:20122,
      phoneNo:1265472698,
      password: req.body.password,
    })
    

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        //if (err) throw err;
        user.password = hash;
        const response = {
          success: true,
          user: user,
        };
        user
          .save()
          .then((user) => res.json(response))
          .catch((err) => console.log(err));
      });
    });
  }

})



})
  


module.exports = router;


