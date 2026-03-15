const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

name: String,

email: {
type: String,
unique: true
},

phone: String,
city: String,

password: String,

deviceId: String

});

module.exports = mongoose.model("User", userSchema);