const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const { v4: uuidv4 } = require('uuid');

const ProductSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  seller_name:{
    type: String,
    required: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  datePublished: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    default: 0,
  },
  images: [
    {
      image: {
        type: String,
      },
    },
  ],
  description: {
    type: String,
  },
  gst: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },

  totalprice: {
    type: Number,
  },
  verified: {
    type: Boolean,
  },
});

module.exports = Products = mongoose.model("Products", ProductSchema);
