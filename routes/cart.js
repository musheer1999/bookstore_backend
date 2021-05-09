const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const Category = require("../models/category");
const passport = require("passport");
const User = require("../models/User");
const Order = require("../models/Order");
const Bill = require("../models/bills");

const { response } = require("express");
const { parseInt } = require("lodash");
var AWS = require("aws-sdk");
var springedge = require("springedge");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

let x = new Date()
let month = (x.getMonth()+1).toString()
month.length==1?month=0+month[0]:month;
let day = (x.getDate()).toString()
day.length==1?day=0+day[0]:day;
let hour = (x.getHours()).toString()
hour.length==1?hour=0+day[0]:hour;
let min = (x.getMinutes()).toString()
min.length==1?min=0+min[0]:min;
let sec = (x.getSeconds()).toString() 
sec.length==1?sec=0+sec[0]:min;
const axios =require("axios");
router.get(
  "/address",
  passport.authenticate("user-strategy", {
    session: false,
  }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      return res.status(200).json(user.address);
    });
  }
);

// router.post(
//   "/addtoseller/:id/:qty",
//   passport.authenticate("user-strategy", { session: false }),
//   (req, res) => {
//     Product.findById(req.params.id)
//       .then((product) => {
//         User.findById(product.seller)
//           .then((seller) => {
//             seller.ordersRecieved.unshift({
//               buyer: req.user.id,
//               productId: req.params.id,
//               quantity: req.params.qty,
//             });
//             seller.save();
//           })
//           .catch((err) => res.json(err));
//       })
//       .catch((err) => res.json(err));
//     return res.json("item added");
//   }
// );

router.post(
  "/address/push",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        user.address.unshift({
          hno: req.body.hno,
          line1: req.body.line1,
          city: req.body.city,
          state: req.body.state,
          pinCode:req.body.pinCode
        });
        user
          .save()
          .then((user) => {
            return res.json(user.address);
          })
          .catch((err) => res.json(err));
      })
      .catch((err) => res.json(err));
  }
);

router.delete(
  "/add/:id",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      user.address.forEach((element) => {
        if (element._id == req.params.id) {
          const index = user.address.indexOf(element);
          user.address.splice(index, 1);
          user.save().then((user) => {
            return res.json(user.address);
          });
        }
      });
    });
  }
);


router.post(
  "/order/push",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {
    const user = await User.findById(req.user.id);
    var i;
    user.bills.unshift({ bill: [] });

   
    let buyer_id;
    let buyer_order_id=[]

    for (i = 0; i < user.cart.length; i++) {
      const product = await Product.findById(user.cart[i].productId);









      const order = new Order({
        buyer: req.user.id,
        seller: product.seller,
        productId: user.cart[i].productId,
        productName: product.product_name,
        desc: product.description,
        productImg: product.images[0].image,
        sellerName: product.seller_name,
        buyerName: user.name,
        category: product.category,
        subcategory: product.subcategory,
        quantity: user.cart[i].quantity,
        address: req.body.address,
        // totalPrice: req.body.totalPrice,
        price:user.cart[i].price,
        netprice:user.cart[i].netprice,
        total_price:user.cart[i].total_price,
        modeOfPayment: req.body.modeOfPayment,
        ID: 8745824 
      });
      order.save();
   

      user.bills[0].bill.unshift({
        order: order._id,
        productName: order.productName,
        totalPrice: order.totalPrice,
        order_detail:order
      });





      buyer_id= order.buyer

buyer_order_id.push(order.ID)

    }



let adminbill = new Bill({
  bill : user.bills[0].bill,
  status:"not delivered"
})

adminbill.save()



console.log(buyer_id)

console.log(buyer_order_id)
let mes = " new  order "






  //message for admin

  var params_admin = {
    Message:mes,
    PhoneNumber: "+91" + 8882664898,
    MessageAttributes: {
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "Ucliq",
      },
    },
  };
  
  var publishTextPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params_admin)
    .promise();




      user.cart = [];
    user.save();




   
    return res.status(200).json("oder placed");
  }
);

router.get(
  "/order/recieved",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        
        Order.find({ seller: user.id })
          .then((orders) => {
            return res.status(200).json(orders);
          })
          .catch((err) => res.json(err));
      })
      .catch((err) => res.json(err));
  }
);




//need to remove after

router.get(
  "/order/myorder",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        
        Order.find({ buyer: user.id })
          .then((orders) => {
            return res.status(200).json(orders);
          })
          .catch((err) => res.json(err));
      })
      .catch((err) => res.json(err));
  }
);

//for testing by musheer
router.get("/ orderid",(req,res)=>{
  Order.find().then((data)=>{
    res.send(data)
  })
})

router.get("/order/view/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  const buyer = await User.findById(order.buyer);
  const product = await Product.findById(order.productId);
  const response = { order, buyer, product };
  return res.status(200).json(response);
});

router.get(
  "/bills",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id).then((user) => {
      return res.status(200).json(user.bills);
    });
  }
);

router.get("/orders/view", async (req, res) => {
  var i;
  var response = [];
  console.log(req.body);
  for (i = 0; i < req.body.orders.length; i++) {
    const order = await Order.findById(req.body.orders[i]);
    response.unshift(order);
  }
  return res.status(200).json(response);
});


router.post("/order/", async (req, res) => {
  var i;
  var response = [];
  console.log(req.body);
  for (i = 0; i < req.body.orders.length; i++) {
    const order = await Order.findById(req.body.orders[i]);
    response.unshift(order);
  }
  return res.status(200).json(response);
});

module.exports = router;
