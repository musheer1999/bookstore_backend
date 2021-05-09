const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const Category = require("../models/category");
const passport = require("passport");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Order = require("../models/Order");

const adminId = "5ecfee89a3980b4c8605df52";

router.post(
  "/seller/status/:orderid",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    Order.findById(req.params.orderid)
      .then((order) => {
        if (!order) {
          return res.status(404).json("order not found");
        }
        order.status = req.body.status;
        order.save();
       let buyer= User.findById(order.buyer).then((user)=>{
         console.log(user.bills)
        user.order_detail?user.order_detail={
            ...user.order_detail,
            status:req.body.status
          }:console.log("not found")
        })
        buyer.save()
        User.findById(order.buyer).then((user) => {
          const notif = new Notification({
            message: "Your order's status: " + order.status,
            userID: user.id,
            messageurl: "/dashboard/yourOrders",
          });
          notif.save();
          user.notifications.unshift({ notifId: notif.id });
          user.save();
        });
        return res.status(200).json(order);
      })
      .catch((err) => res.json(err));
  }
);


//cancel order by seller 

router.post(
  "/seller/cancel/:orderid",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    Order.findById(req.params.orderid)
      .then((order) => {
        if (!order) {
          return res.status(404).json("order not found");
        }
        order.status = "cancelled";
        order.save();
        console.log("the buyer"+order.buyer+ "   "+order.buyerName)
       User.findById(order.buyer).then((user)=>{
     
      
         for(let od=0;od<user.bills.length;od++){
        
           if(user.bills[od].bill[0]!=undefined?user.bills[od].bill[0].order_detail._id==req.params.orderid:console.log(user.bills[od].bill[0])){
            user.bills[od].bill[0].order_detail.status="cancelled"
         console.log(user.bills[od].bill[0].order_detail)
         console.log(user.bills[od].bill[0].order_detail.status)
         console.log(user)
         user.save()
           }
         }
        // user.bills.bill.order_detail?user.order_detail={
        //     ...user.order_detail,
        //     status:"cancelled"
        //   }:console.log("not found")
        }).catch((err) => console.log(" the err" +err));
       
        // User.findById(order.buyer).then((user) => {
        //   const notif = new Notification({
        //     message: "Your order's status: " + order.status,
        //     userID: user.id,
        //     messageurl: "/dashboard/yourOrders",
        //   });
        //   notif.save();
        //   user.notifications.unshift({ notifId: notif.id });
        //   user.save();
        // });
        return res.status(200).json(order);
      })
      .catch((err) => res.json(err));
  }
);


// ??
router.post(
  "/order/ready/:orderid",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    Admin.findById(adminId).then((admin) => {
      admin.orders.unshift({
        order: req.params.orderid,
      });
      admin
        .save()
        .then((element) => {
          return res.status(200).json(element);
        })
        .catch((err) => res.json(err));
    });
  }
);

router.get(
  "/getallorders",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    Order.find({ buyer: req.user.id })
      .then((items) => {
        return res.status(200).json(items);
      })
      .catch((err) => res.json(err));
  }
);

router.get("/view/:id", (req, res) => {

  Order.findById(req.params.id).then((order) => {

    if (order) {
      User.findById(order.seller).then((seller) => {
   
        const sellerAddress={
         hno:seller.address[0].hno,
         line1:seller.address[0].line1,
         city:seller.address[0].city,
         state:seller.address[0].state,
        }
        return res.status(200).json({order:order,sellerAddress:sellerAddress});
      })
      .catch((err) => res.json({order:order}));
    }
     //return res.status(404).json("order not found");
  })
  .catch((err) => res.json(err));
});

module.exports = router;
