const mongoose = require("mongoose");
const Store = mongoose.model("Store");

exports.homePage = (req, res) => {
  res.render("index");
};
exports.addStore = (req, res) => {
  res.render("editStore", {
    title: "Add a Store"
  });
};
exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully created ${store.name}. Care to leave a review?`
  );
  res.redirect(`/store/${store.slug}`);
};
exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
};
exports.editStore = async (req, res) => {
  const store = await Store.findById(req.params.storeId);
  res.render("editStore", { title: `Edit ${store.name}`, store });
};
exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findByIdAndUpdate(req.params.storeId, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash("success", "Successfully Updated");
  res.redirect(`/store/${store.slug}`);
};