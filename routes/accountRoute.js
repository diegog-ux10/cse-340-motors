// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const { handleErrors, checkLogin } = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to build default account view
router.get("/", checkLogin, handleErrors(accountController.buildAccount));

// Route to build account login view
router.get("/login", handleErrors(accountController.buildLogin));

// Process login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  handleErrors(accountController.accountLogin)
)

// Route to build account register view
router.get("/register", handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  handleErrors(accountController.registerAccount)
)

router.get(
  "/edit/:account_id",
  checkLogin,
  handleErrors(accountController.buildAccountEdit)
)

router.post(
  "/update",
  checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkAccountData,
  handleErrors(accountController.updateAccount)
)

router.post(
  "/password",
  checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  handleErrors(accountController.updatePassword)
)

// Process logout
router.get(
  "/logout",
  handleErrors(accountController.logoutAccount)
)

module.exports = router