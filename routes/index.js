const express = require("express");
const router = express.Router();
const {
  getStores,
  getStoreBySlug,
  getStoresByTag,
  addStore,
  createStore,
  updateStore,
  editStore,
  upload,
  resize
} = require("../controllers/storeController");
const { loginForm, registerForm, validateRegister, register, account, updateAccount } = require("../controllers/userController");
const { login, logout, isLoggedIn, forgot, resetPasswordForm, update, confirmedPassword } = require("../controllers/authController");

const { catchErrors } = require("../handlers/errorHandlers");

// Do work here
router.get("/", catchErrors(getStores));
router.get("/stores", catchErrors(getStores));
router.get("/stores/:slug", catchErrors(getStoreBySlug));
router.get("/add", isLoggedIn, addStore);
router.post("/add", isLoggedIn, upload, catchErrors(resize), catchErrors(createStore));
router.post("/add/:storeId", isLoggedIn, upload, catchErrors(resize), catchErrors(updateStore));
router.get("/stores/:storeId/edit", isLoggedIn, catchErrors(editStore));
router.get("/tags", catchErrors(getStoresByTag));
router.get("/tags/:tag", catchErrors(getStoresByTag));

// Auth
router.get('/login', loginForm);
router.get('/register', registerForm);
router.post('/register', validateRegister, register, login);
router.get('/logout', logout);
router.post('/login', login);

router.get('/account', isLoggedIn , account);
router.post('/account', isLoggedIn , catchErrors(updateAccount));
router.post('/account/forgot' , catchErrors(forgot));
router.get('/account/reset/:resetToken' , catchErrors(resetPasswordForm));
router.post('/account/reset/:resetToken' , confirmedPassword, catchErrors(update));

module.exports = router;
