const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require('es6-promisify');

exports.login = (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return next(err);
    }
    // Redirect if it fails
    if (!user) {
      req.flash("error", "Invalid username or password!");
      return res.redirect("/login");
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      // Redirect if it succeeds
      req.flash("success", "You are now logged in!");
      return res.redirect("/");
    });
  })(req, res, next);
};
exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out!");
  res.redirect("/");
};
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Oops! You must be logged in");
  res.redirect("/login");
};
exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "No user found with this email");
    return res.redirect("/login");
  }
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;
  req.flash("success", `You\'ve been mailed a password reset url ${resetURL}`);
  res.redirect("/login");
};
exports.resetPasswordForm = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.resetToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password reset is invalid  or has expired");
    res.redirect("/login");
  }
  res.render("reset", { title: "Change you password" });
};
exports.confirmedPassword = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next();
    return;
  }
  req.flash("error", "Password not matched");
  res.redirect("back");
};
exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.resetToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password reset is invalid  or has expired");
    res.redirect("/login");
  }
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Password has been changed');
  res.redirect('/');
};
