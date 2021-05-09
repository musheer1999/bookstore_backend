const { schema } = require("./Order");

const Schema = require("mongoose").Schema;

const UserSchema = new Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },  
  name: {
    type: String,
    default: "no name specified",
  },
  companyName: {
    type: String,
    default: "none",
  },
  taxDetails: {
    type: String,
    default: "no tax details specified",
  },
  bankDetails: {
    bankname: {
      type: String,
    },
    iifsc: {
      type: String,
    },
    accountnumber: {
      type: String,
    },
  },
  myTeam: [
    {
      members: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  business: {
    type: String,
    default: "none",
  },
  address: [
    {
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
      pinCode:{
        type:String
      }
    },
  ],
  pinCode: {
    type: String,
    default: "will be taken using IP",
  },
  phoneNo: {
    type: String,
    required: true,
  },
  OTP: {
    type: Number,
  },
  avatar: {
    type: String,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isDocSubmitted: {
    type: Boolean,
    default: false,
  },
  isDocVerified: {
    type: Boolean,
    default: false,
  },
  isSetupRequired: {
    type: Boolean,
    default: true,
  },
  docInfo: {
    gstin: {
      doc: {
        type: String,
      },
      submitted: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: "",
      },
    },
    shopLic: {
      doc: {
        type: String,
      },
      submitted: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: "",
      },
    },
    fssai: {
      doc: {
        type: String,
      },
      submitted: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: "",
      },
    },
    mcdcerti: {
      doc: {
        type: String,
      },
      submitted: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: "",
      },
    },
    anyoth: {
      doc: {
        type: String,
      },
      submitted: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: "",
      },
    },
  },
  products: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Products",
      },
    },
  ],
  cart: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Products",
      },
      quantity: {
        type: Number,
      },
      displayImg: {
        type: String,
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
      prodName: {
        type: String,
      },
      gst: {
        type: Number,
      },
      discount: {
        type: Number,
      },
    },
  ],
  bills: [
    {
      bill: [
        {
          order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
          },
          productName: {
            type: String,
          },
          totalPrice: {
            type: Number,
          },
          order_detail:{
          type:Object
          }
        },
      ],
    },
  ],
  recentVisit: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Products",
      },
    },
  ],
  notifications: [
    {
      notifId: {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    },
  ],
});

module.exports = User = require("mongoose").model("User", UserSchema);
