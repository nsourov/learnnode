const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.loginForm = (req, res) => res.render("login", { title: "login" });
exports.registerForm = (req, res) =>
  res.render("register", { title: "register" });
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name").notEmpty();
  req.checkBody("email", "That email is not valid").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "Password cant be empty").notEmpty();
  req
    .checkBody("password-confirm", "Confirm Password cant be empty")
    .notEmpty();
  req
    .checkBody("password-confirm", "Password doesnt match")
    .equals(req.body.password);
  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash()
    });
    return;
  }
  next();
};
exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
};
exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};
exports.updateAccount = async (req, res) => {  
  const user = await User.findByIdAndUpdate(
    {_id: req.user._id},
    { $set: req.body },
    { new: true, runValidators: true, context: 'query' }
  )
  res.redirect('back');
};