require("dotenv/config");
const app = require("express")();
const router = require("express").Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");
const path = require("path");
const Product = require("../models/Products");
const User = require("../models/User");
const Admin = require("../models/Admin");
const passport = require("passport");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|pdf|docx/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: This type of file is not allowed!");
  }
}

const storage = multerS3({
  s3: s3,
  bucket: "ucliq",
  metadata: function (req, file, cb) {
    cb(null, {
      fieldName: file.fieldname,
    });
  },
  key: function (req, file, cb) {
    //let prefixPath = req.body.prefixPath;
    let myFile = file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const newName = `${Date.now()}.${fileType}`.toString();
    console.log("newName: ", newName);
    cb(null, newName);
  },
  acl: "public-read",
  destination: function (req, file, callback) {
    callback(null, "");
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  }, // 2mb
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const upload = multer({
  storage,
}).any();



router.post(
  "/products/:id",
  upload,
  passport.authenticate("user-strategy", {
    session: false,
  }),
  (req, res, next) => {
    try {
 
      Product.findById(req.params.id).then((product) => {
        let m = [];
        for (let i = 0; i < req.files.length; i++)
          m.push({
            image: req.files[i].location,
          });
        product.images = m;
        product.save();
      });
      res.send(req.files.map((eachFile) => eachFile.location));
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);


// upload by Admin
router.post(
  "/admin/products/:id",
  upload,
  passport.authenticate("admin-strategy", {
    session: false,
  }),
  (req, res, next) => {
    try {
 
      Product.findById(req.params.id).then((product) => {
        let m = [];
        for (let i = 0; i < req.files.length; i++)
          m.push({
            image: req.files[i].location,
          });
        product.images = m;
        product.save();
      });
      res.send(req.files.map((eachFile) => eachFile.location));
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);


router.post(
  "/documents",
  upload,
  passport.authenticate("user-strategy", {
    session: false,
  }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        for (let i = 0; i < req.files.length; i++) {
          if (req.files[i].fieldname == "gstin") {
            user.docInfo.gstin.doc = req.files[i].location;
            user.docInfo.gstin.submitted = true;
            user.docInfo.gstin.status = "";
          } else if (req.files[i].fieldname == "shopLic") {
            user.docInfo.shopLic.doc = req.files[i].location;
            user.docInfo.shopLic.submitted = true;
            user.docInfo.shopLic.status = "";
          } else if (req.files[i].fieldname == "fssai") {
            user.docInfo.fssai.doc = req.files[i].location;
            user.docInfo.fssai.submitted = true;
            user.docInfo.fssai.status = "";
          } else if (req.files[i].fieldname == "mcdcerti") {
            user.docInfo.mcdcerti.doc = req.files[i].location;
            user.docInfo.mcdcerti.submitted = true;
            user.docInfo.mcdcerti.status = "";
          } else if (req.files[i].fieldname == "anyoth") {
            user.docInfo.anyoth.doc = req.files[i].location;
            user.docInfo.anyoth.submitted = true;
            user.docInfo.anyoth.status = "";
          }
        }
        user.isDocSubmitted = true;
        user.save();
        console.log(user.docInfo);
        res.status(200).json(user.docInfo);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
    // try {
    //   User.findById(req.user.id).then((user) => {
    //     user.docInfo.docs.unshift({
    //       doc: req.files[0].location,
    //     });
    //     user.save();
    //   });
    // } catch (err) {
    //   console.log(err);
    // }
  }
);

router.post(
  "/documents/verify",
  passport.authenticate("user-strategy", {
    session: false,
  }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      const doc = req.body.doc;
      user.docInfo.doc.status = "verified";
      user.save();
    });
  }
);

router.post(
  "/userdocs/", // route to upload user docs
  upload,
  passport.authenticate("user-strategy", {
    session: false,
  }),
  (req, res, next) => {
    try {
      User.findById(req.user.id).then((user) => {
        let m = [];
        for (let i = 0; i < req.files.length; i++)
          m.push({
            doc: req.files[i].location,
          });
        user.documents = m;
        user.save();
      });
      res.send(req.files.map((eachFile) => eachFile.location));
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

// will use for admin to delete any php;oto from website
router.delete("/delete/:file_name", (req, res) => {
  var params = {
    Bucket: "ucliq",
    Key: req.params.file_name,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      console.log(data);
      return res.json({
        file: req.params.file_name,
        message: "deleted successfully!",
      });
    }
  });
});

router.delete("/files", (req, res) => {
  console.log(req.body.images);
  req.body.images.forEach((element) => {
    var prefix = "https://ucliq.s3.ap-south-1.amazonaws.com/";
    var params = {
      Bucket: "ucliq",
      Key: element.image.slice(prefix.length),
    };
    s3.deleteObject(params, function (err, data) {
      if (err) throw console.log(err, err.stack);
    });
  });
  return res.json("images deleted successfully");
});

router.delete("/deleteFiles", (req, res) => {
  console.log(req.body.images);
  req.body.images.forEach((element) => {
    var prefix = "https://ucliq.s3.ap-south-1.amazonaws.com/";
    var params = {
      Bucket: "ucliq",
      Key: element.slice(prefix.length),
    };
    console.log(params);
    s3.deleteObject(params, function (err, data) {
      if (err) throw console.log(err, err.stack);
      else console.log("deleteObjectData:", data);
    });
  });
  return res.json("images deleted successfully");
});

router.post("/update/:id", upload, (req, res) => {
  try {
    Product.findById(req.params.id).then((product) => {
      let m = [];
      for (let i = 0; i < req.files.length; i++)
        m.push({
          image: req.files[i].location,
        });
      product.images = [...product.images, ...m];
      product.save();
    });
    res.status(200).send(req.files.map((eachFile) => eachFile.location));
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
