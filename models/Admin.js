const { ObjectID } = require("mongodb");

const Schema = require("mongoose").Schema;

const AdminSchema = new Schema({
  name: {
    type: String,
    default: "Admin",
  },
  password: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  email: {
    type: String,
  },
  avatar: {
    type: String,
  },
  productsAdded: [
    {
      productId: {
        type: Schema.Types.ObjectID,
        ref: "Products",
      },
    },
  ],
  orders: [
    {
      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    },
  ],
});

module.exports = Admin = require("mongoose").model("Admin", AdminSchema);
