const Schema = require('mongoose').Schema;


const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imgurl: {
        type: String,
        required: true
    },
    listofcat: {
        type: Array
    }
});

module.exports = Category = require('mongoose').model('Category', CategorySchema);