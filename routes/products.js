const express = require("express");
const router = express.Router();
const Product = require("../models/Products");
const Category = require("../models/category");
const passport = require("passport");
const User = require("../models/User");
const AWS = require("aws-sdk");
const Admin = require("../models/Admin");
const { orderBy } = require("lodash");
const Razorpay = require("razorpay");
const shortid =require("shortid")
const adminId = "5ecfee89a3980b4c8605df52";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
let x = new Date()
let month = (x.getMonth()+1).toString()
month.length==1?month=0+month[0]:month;
let day = (x.getDate()).toString()
day.length==1?day=0+day[0]:day;

let  id =   (x.getYear()-100 ).toString() + month  + day  

let date = parseInt(id)
// this route will help in adding categories to the db
router.post("/addcategory", (req, res) => {
  const category = new Category(req.body);
  // console.log(category)
  category
    .save()
    .then(() => res.json({ msg: "categories updated" }))
    .catch((err) => res.json(err));
});

router.post("/addsubcat", async (req, res) => {
  var cat = await Category.findOne({ name: req.body.name });
  if (cat) {
    for (let i = 0; i < cat.listofcat.length; i++)
      if (cat.listofcat[i].name == req.body.subcat) {
        res.json({ msg: "already added" });
        return;
      }
    // cat.listofcat.push(req.body.subcat);
    cat.listofcat.push({ name: req.body.subcat, url: req.body.url });
    await cat.save();
    res.json({ msg: "sub cat updated" });
    return;
  }
  //
  return res.json({ msg: "cat not exist" });
});

router.post("/getallcats", (req, res) => {
  console.log("getallcats")
  Category.find()
    .then((list) => {
      console.log(list)
      res.json(list);
    })
    .catch((err) => {
      res.json(err);
    });
});

//get no of orders
router.get("/no", (req, res) => {
  console.log("yess")
  
    Orderno.find()
    .then((Order) => res.json(Order))
    .catch((err) => res.json(err));
  });




  router.get("/update/:set", async (req, res) => {
    let x= await Orderno.find()
   
     if(req.params.set=="inc"){
      Orderno.findByIdAndUpdate("60686074b5f6b3229edf06d7", {
        orderno:x[0].orderno+1
      })
        .then((x) => {
          res.status(200).json({ msg: "updated" });
        })
        .catch(() => {
          res.status(404).json({ msg: "not found" });
        });
     }else{
      Orderno.findByIdAndUpdate("60686074b5f6b3229edf06d7", {
        date:req.params.set,
        orderno:1
      })
        .then((x) => {
          res.status(200).json({ msg: "updated" });
        })
        .catch(() => {
          res.status(404).json({ msg: "not found" });
        });
     }
    console.log(x)
      
      })

router.post("/getallsubcats", async (req, res) => {
  // 2
  var cat = await Category.findById(req.body.id);
  res.json({ list: cat.listofcat, catname: cat.name });
});

router.post("/getsubcat", async (req, res) => {
  // 3
  console.log(req.body.category)
  var items = await Product.find({ category:req.body.category});
  var to = await Product.find();

  res.json(items);
});
router.get("/all_product",async(req,res)=>{
  var item = await Product.find();
  res.json(item);
})


// this route will help in getting all products for a category
// router.get('/singlecategory', (req, res) => {
//     Product
//         .find({ category: req.body.name })
//         .then(products => res.json(products))
//         .catch(err => res.json(err))
// })

// // this route will help in getting all details for an item of a particualar category
// router.get('/itemdetails', (req, res) => {
//     Product
//         .findById(req.body.id)
//         .then(product => res.json(product))
//         .catch(err => res.json(err))
// })

router.get("/", (req, res) => {

  Product.find()
    .then((allProducts) => res.json(allProducts))
    .catch((err) => res.json(err));
});

router.get(
  "/:product_id",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    User.findById(req.user.id)
      .then((user) => {
        if (user.recentVisit.length == 5) {
          user.recentVisit[4].productId = req.params.product_id;
          user.save();
        } else {
          user.recentVisit.unshift({ productId: req.params.product_id });
          user.save();
        }
        Product.findById(req.params.product_id)
          .then((productReq) => {
            Product.find({ subcategory: productReq.subcategory })
              .exec()
              .then((items) => {
                return res.status(200).json(items);
              });
            const response = {
              product: productReq,
              similar: items,
            };
            return res.json(response);
          })
          .catch((err) => res.json(err));
      })
      .catch((err) => res.json(err));
  }
);

router.get("/:product_id/public", (req, res) => {
  Product.findById(req.params.product_id)
    .then((productReq) => {
      Product.find({ subcategory: productReq.subcategory })
        .exec()
        .then((items) => {
          const response = {
            product: productReq,
            similar: items,
          };
          return res.status(200).json(response);
        });
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
});

router.post(
  "/addtocart",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {
    // console.log(req.user)
    // console.log(req.user.id);
    // console.log(req.body.productId);
    let user = await User.findById(req.user.id);
    // user.cart.length = 0
    console.log(req.body)
    if (user) {
      let i = -1;
      if (user.cart.length > 0) {
        for (i = 0; i < user.cart.length; i++) {
          if (user.cart[i].productId == req.body.productId) {
            user.cart[i].quantity += req.body.quantity;
          
           user.cart[i].total_price+= req.body.total_price;
            break;
          }
        }

        if (i >= user.cart.length) {
          // console.log(req.body);
          user.cart.push(req.body);
        }
      } else user.cart.push(req.body);
      user.save();
      return res.json({ msg: "added" });
    }
    return res.json({ msg: "err" });
  }
);

router.post(
  "/getcart",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {
    let user = await User.findById(req.user.id);
    if (user) return res.json({ cart: user.cart, id: req.user.id });
    return res.json({ msg: "err" });
  }
);

//route to add products by user
router.post(
  "/addproduct",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {

    let t = parseInt(req.body.gst * req.body.price *0.01) +parseInt(req.body.price);
  
  
    t=parseInt(t)-parseInt(req.body.discount * req.body.price *0.01)
   
  
    const newProduct = new Product({
      product_name: req.body.product_name,
      category: req.body.category,
      subcategory: req.body.subcat,
      seller: req.user.id,
      seller_name: req.body.seller_name,
      qty: req.body.qty,
      price: req.body.price,
      gst: req.body.gst,
      description: req.body.description,
      discount: req.body.discount,
      totalprice:t,
      verified:false
    });

  

    console.log(newProduct)
    newProduct.save();

    const admin = await Admin.findById(adminId);
    admin.productsAdded.unshift({
      productId: newProduct.id,
    });
    admin.save();
    req.user.products.unshift({
      productId: newProduct.id,
    });

 
    // console.log(req.user)
    // console.log("jwt is signing");

    // the below line is commented by me
    // jwt.sign(payload, keys.secretOrKey, (err, token) => {
    //   res.json({
    //     success: true,
    //     userId: user.id,
    //     token: "Bearer " + token,
    //   });
    // });
    req.user
      .save()
      .then((item) => res.status(200).json(newProduct))
      .catch((err) => res.status(500).json(err));
  }
);

router.post(
  "/getuserproducts",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {
    const products = await Product.find({ seller: req.user.id });
    // console.log(1, products)
    if (products) {
      res.json(products);
      return;
    }
    res.json({ msg: "no products" });
  }
);

//to delete a product
router.delete(
  "/removeproduct/:product_id",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {
    let product = await Product.findById(req.params.product_id);
    product.images.forEach((element) => {
      var prefix = "https://ucliq.s3.ap-south-1.amazonaws.com/";
      var params = {
        Bucket: "ucliq",
        Key: element.image.slice(prefix.length),
      };
      s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
      });
    });
    Product.findByIdAndDelete(req.params.product_id)
      .then((removedProduct) => res.json(removedProduct))
      .catch((err) => res.json(err));
  }
);

//to update product details
router.post(
  "/updateproduct/:id",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    Product.findByIdAndUpdate(req.params.id, req.body)
      .then(() => {
        res.status(200).json({ msg: "updated" });
      })
      .catch(() => {
        res.status(404).json({ msg: "not found" });
      });
  }
);

router.get("/all/products", (req, res) => {
  Product.find()
    .exec()
    .then((products) => {
      res.status(200).json(products);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// delete item from cart
router.delete(
  "/deleteitemcart/:id",
  passport.authenticate("user-strategy", { session: false }),
  async (req, res) => {
    // console.log(req.body)
    let user = await User.findById(req.user.id);
    if (user) {
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].productId == req.params.id) {
          user.cart.splice(i, 1);
          break;
        }
      }
      user.save();
      return res.json({ msg: "deleted" });
    }
    res.json({ msg: "err" });
  }
);

router.post("/random/:category", (req, res) => {
  const category = req.params.category;
  const items = [];
  console.log(category);
  Product.find({ category })
    .limit(5)
    .exec()
    .then((results) => {
      results.forEach((i) => {
        items.push({
          _id: i._id,
          name: i.product_name,
          imgurl: i.images[0].image,
        });
      });
      res.send(items);
    });
});

router.get("/similar/:id", (req, res) => {
  Product.findById(req.params.id).then((product) => {
    Product.find({ subcategory: product.subcategory })
      .exec()
      .then((items) => {
        return res.status(200).json(items);
      });
  });
});

router.post("/dealOfDay", (req, res) => {
  console.log("In deal of Day Item");
  const parameter = { category: "Food - Staples" };
  const items = [];
  console.log(parameter);
  Product.find(parameter)
    .limit(5)
    .exec()
    .then((results) => {
      results.forEach((i) => {
        items.push({
          _id: i._id,
          name: i.product_name,
          imgurl: i.images[0].image,
        });
      });
      res.send(items);
    });
});

router.post("/suggested", (req, res) => {
  console.log("In suggested Item");
  const parameter = { category: "Food - Staples" };
  const items = [];
  console.log(parameter);
  Product.find(parameter)
    .limit(5)
    .exec()
    .then((results) => {
      results.forEach((i) => {
        items.push({
          _id: i._id,
          name: i.product_name,
          imgurl: i.images[0].image,
        });
      });
      res.send(items);
    });
});

router.post("/discount", (req, res) => {
  console.log("In discount Item");
  const parameter = { category: "Food - Staples" };
  const items = [];
  console.log(parameter);
  Product.find(parameter)
    .limit(5)
    .exec()
    .then((results) => {
      results.forEach((i) => {
        items.push({
          _id: i._id,
          name: i.product_name,
          imgurl: i.images[0].image,
        });
      });
      res.send(items);
    });
});

router.post(
  "/recentlyViewed",
  passport.authenticate("user-strategy", { session: false }),
  (req, res) => {
    console.log("In recentlyViewed Item");
    const parameter = { category: "Food - Staples" };
    const items = [];
    console.log(parameter);
    Product.find(parameter)
      .limit(5)
      .exec()
      .then((results) => {
        results.forEach((i) => {
          items.push({
            _id: i._id,
            name: i.product_name,
            imgurl: i.images[0].image,
          });
        });
        res.send(items);
      });
  }
);


router.post("/incordorno",(req,res)=>{


let order = new Orderno({
  date:id,
orderno:0
})

console.log(order)

order.save().then((order)=>{
  res.json(order)
})

}) 


router.get("/razorpay", async (req,res)=>{

  const payment_capture =1
  const amount = 400
  const currency = "INR" 
 
  const options = {amount:"49900",
     currency,
      receipt:shortid.generate(),
       payment_capture}
try{ const response= await razorpay.orders.create(options)
 console.log(response)
return res.json({
     id:response.id,
     currency:'INR',
     amount:response.amount
 })} catch(error){
  res.json({
      id:"response.id,"
  })
 }
})


module.exports = router;










