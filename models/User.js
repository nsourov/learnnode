const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const validator = require("validator");
const md5 = require("md5");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please Supply and email address"
  },
  name: {
    type: String,
    required: "Please supplu a name",
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: String,
  hearts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Store'
    }
  ]
});

UserSchema.virtual('gravatar').get(function(){
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`
});
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });
UserSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", UserSchema);
