const mongose = require('mongoose');
const bycrypt = require('bycrypt');

const userSchema = new mongose.Schema({
    Name: {
        type: String,
        required: true,
    },

    Email: {
        type: String,
        required: true,
        unique: true,
    },

    Password: {
        type: String,
        required: true,
         unique: true,
    },

    Gender: {
        type: String,
        required: true,
    },

    hasAtmCard: {
        type: Boolean,
        default:false
    },

    Phone: {
        type: String,
        required: true,
    },

    Role: {
        type: String,
        enum: {'admin': 'user'},
        default: 'user'
    },

    Timestamps: true // date created and date modfied

    



});

//CREATE MODEL
const User = mongose.model('user', userSchema);
