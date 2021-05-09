const mongoose = require("mongoose");
const Admin = mongoose.model("Admin");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
require("dotenv").config();
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(
    "admin-strategy",
    new JwtStrategy(opts, (jwt_payload, done) => {
      Admin.findById(jwt_payload.id)
        .then((admin) => {
          if (admin) {
            return done(null, admin);
          }
          return res.json({message:"falseeeeeee"})
        })
        .catch((err) => console.log(err));
    })
  );
};
