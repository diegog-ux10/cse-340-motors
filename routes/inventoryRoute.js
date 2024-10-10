// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const { handleErrors } = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build inventory by vehicle view
router.get("/detail/:invId", handleErrors(invController.buildByInvId));

module.exports = router;