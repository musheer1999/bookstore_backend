
const mongoose = require("mongoose")
const Schema  = mongoose.Schema

const BillSchema = new Schema(
    {
       bill:[],
        status:{
            type:String
        }
    }

    )

module.exports =Bill =  mongoose.model("Bill", BillSchema);