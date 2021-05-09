const Schema = require("mongoose").Schema;
let x = new Date

const OrderSchema = new Schema({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Products",
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
  },
  status: {
    type: String,
    default: "order not confirmed yet",
  },
  address: {
    hno: {
      type: String,
    },
    line1: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
  },
  netprice: {
    type: Number,
  },
  total_price: {
    type: Number,
  },
  modeOfPayment: {
    type: String,
  },
  productName: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  productImg: {
    type: String,
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  buyerName: {
    type: String,
  },
  ID:{
    type: String,
  
  }

});

module.exports = Order = require("mongoose").model("Order", OrderSchema);
