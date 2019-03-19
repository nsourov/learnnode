const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require('slugs');

const StoreSchema = new mongoose.Schema({
 name: {
   type: String,
   trim: true,
   required: 'Please enter a slug name!'
 },
 slug: String,
 description: {
   type: String,
   trim: true
 },
 tags: [String]
});

StoreSchema.pre('save', function(next){
  if(!this.isModified('name')){
    next();
    return;
  }
  this.slug = slug(this.name);
  next();
});

module.exports = mongoose.model('Store', StoreSchema);
