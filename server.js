const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
const cors = require("cors");
var compression = require("compression");
var AWS = require("aws-sdk");
require("dotenv/config");
var server = require("http").createServer(app);
var io = require("socket.io")(server);

const productsRoute = require("./routes/products");
const profileRoute = require("./routes/profile");
const cartRoute = require("./routes/cart");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const uploadRoute = require("./services/awsS3");
const sellerRoute = require("./routes/seller");


app.use(
  cors({
    origin: ["http://localhost:3000","http://266e84bea7f5.ngrok.io","http://ec2-65-2-149-157.ap-south-1.compute.amazonaws.com:3000"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(compression());
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoDB connected."))
  .catch((err) => console.log(err));

app.use(passport.initialize());
require("./config/passport")(passport);
require("./config/adPassport")(passport);

app.use("/api/products", productsRoute);
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/cart", cartRoute);
app.use("/api/seller", sellerRoute);


server.listen(port, () => console.log(`Listening o port ${port}`));

