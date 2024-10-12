// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const { handleErrors } = require("../utilities")

// Route to build account login view
router.get("/login", handleErrors(accountController.buildLogin));

// Route to build account register view
router.get("/register", handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
  "/register",
  handleErrors(accountController.registerAccount)
)


module.exports = router