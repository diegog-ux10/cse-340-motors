// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const { handleErrors, checkAuthorization } = require("../utilities")
const invValidate = require('../utilities/inventory-validation')

// Public Routes (No Authorization Required)
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build inventory by vehicle view
router.get("/detail/:invId", handleErrors(invController.buildByInvId));

// Protected Management Routes (Authorization Required)
// Route to build inventory management index
router.get(
    "/",
    checkAuthorization,
    handleErrors(invController.buildManagement)
)

// Route to build add classification view
router.get(
    "/addclass",
    checkAuthorization,
    handleErrors(invController.buildAddclass)
)

// Process the new classification data
router.post(
    "/addclass",
    checkAuthorization,
    invValidate.classRules(),
    invValidate.checkClassData,
    handleErrors(invController.addClass)
)

// Route to build add vehicle view
router.get(
    "/addvehicle",
    checkAuthorization,
    handleErrors(invController.buildAddvehicle),
)

// Process the new vehicle data
router.post(
    "/addvehicle",
    checkAuthorization,
    invValidate.vehicleRules(),
    invValidate.checkVehicleData,
    handleErrors(invController.addVehicle),
)

// Build inventory management table inventory view
router.get(
    "/getInventory/:classification_id", 
    checkAuthorization,
    handleErrors(invController.getInventoryJSON)
)

// Build edit vehicle information view
router.get(
    "/edit/:inv_id", 
    checkAuthorization,
    handleErrors(invController.buildVehicleEdit)
)
  
// Post route /update
router.post(
    "/update",
    checkAuthorization,
    invValidate.vehicleRules(),
    invValidate.checkVehicleUpdateData,
    handleErrors(invController.updateVehicle)
)

// Build vehicle deletion confirmation view
router.get(
    "/delete/:inv_id", 
    checkAuthorization,
    handleErrors(invController.buildVehicleDeleteConfirm)
)
  
// Post route /delete
router.post(
    "/delete", 
    checkAuthorization,
    handleErrors(invController.deleteVehicle)
)

module.exports = router;