// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const { handleErrors } = require("../utilities")
const invValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
// Route to build inventory by vehicle view
router.get("/detail/:invId", handleErrors(invController.buildByInvId));

// MANAGEMENT ROUTES ** NeEdS tO Be ChAnGeD **
// Route to build inventory index
router.get(
    "/",
    handleErrors(invController.buildManagement)
)

// Route to build add classification view
router.get(
    "/addclass",
    handleErrors(invController.buildAddclass)
)

// Process the new classification data
router.post(
    "/addclass",
    invValidate.classRules(),
    invValidate.checkClassData,
    handleErrors(invController.addClass)
)

// Route to build add vehicle view
router.get("/addvehicle",
    handleErrors(invController.buildAddvehicle),
)

// Process the new vehicle data
router.post(
    "/addvehicle",
    invValidate.vehicleRules(),
    invValidate.checkVehicleData,
    handleErrors(invController.addVehicle),
)

// Build inventory management table inventory view
router.get("/getInventory/:classification_id", handleErrors(invController.getInventoryJSON))

// Build edit vehicle information view
router.get(
    "/edit/:inv_id",
    handleErrors(invController.buildVehicleEdit)
)

// Post route /update
router.post(
    "/update",
    invValidate.vehicleRules(),
    invValidate.checkVehicleUpdateData,
    handleErrors(invController.updateVehicle)
)

// Build vehicle deletion confirmation view
router.get(
    "/delete/:inv_id",
    handleErrors(invController.buildVehicleDeleteConfirm)
)

// Post route /delete
router.post(
    "/delete",
    handleErrors(invController.deleteVehicle)
)

// Route to build broken page
router.get("/broken", handleErrors(invController.buildBrokenPage));

module.exports = router;