var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    password: {type: String, required: true},
    username: {type: String, unique: true, required: true, trim: true},
    information: {
        fun_facts: {
            fun1: {type: String, default:null},
            fun2: {type: String, default:null},
            fun3: {type: String, default:null}
        },
        personal: {
            firstName: {type: String, default:null},
            lastName: {type: String, default:null},
            Department: {type: String, default:null},
            Title: {type: String, default:null},
            LinkedIn: {type: String, default: null},
            email: {type: String, default:null},
        },
        profilePic: { type: String, data: Buffer, contentType: String, default:null},
        bio: {type: String, default:null}
    },
    marker: {type: String, data: Buffer, default:null, contentType: String},
    section: {type: Number, default:1}
});

module.exports = mongoose.model("User", userSchema);