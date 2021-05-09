const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String
    },
    chat: [{
        type: {
            type: String
        },
        msg: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    newMsgAlert: {
        type: Boolean,
        default: false
    }
})

module.exports = Chat = mongoose.model("Chats", ChatSchema);
