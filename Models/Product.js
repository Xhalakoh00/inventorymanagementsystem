const mongose = require('mongoose');
const  productSchema = mongose.Schema({
    Name: {
        type: String,
        required: true,
    },

    size: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
    },

    quantity: {
        type: Number,
        required: true
    },

     color: {
        type: String,
        //required: true
    },


});

Timestamps: true // date created and date modfied at

//CREATE MODEL
const product = mongose.model('product', productSchema);


