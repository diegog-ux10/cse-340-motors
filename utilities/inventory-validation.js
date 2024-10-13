const invModel = require("../models/inventory-model")
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Add Class Validation Rules
 * ********************************* */
validate.classRules = () => {
  return [
    body("classification_name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be longer than 3 characters")
    .isAlpha()
    .withMessage("Please use only letters in the name")
    .custom(async (classification_name) => {
      const classificationExists = await invModel.checkExistingClassification(classification_name)
      if (classificationExists){
        throw new Error("Classification already exists")
      }
    }),
  ]
}

/* ******************************
 * Check class data and return errors or continue to registration
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("./inventory/addclass", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
 *  Add Class Validation Rules
 * ********************************* */
validate.vehicleRules = () => {
  return [
    body("classification_id")
    .isNumeric()
    .withMessage('Please select a classification'),

    body("inv_make")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Make must be longer than 3 characters"),

    body("inv_model")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Model must be longer than 3 characters"),

    body("inv_year")
    .trim()
    .isNumeric({ no_symbols: true })
    .withMessage("Year must be digits only")
    .isLength({ min: 4, max: 4 })
    .withMessage("Year must be 4 digits"),

    body("inv_description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Please provide a description"),

    // add image path regex check!
    body("inv_image")
    .trim()
    .matches(/^\/images\/vehicles\/[a-zA-Z0-9\-_]+\.([a-zA-Z]{3,4})$/)
    .withMessage("Please provide an image path ex.\/images\/vehicles\/example.png"),

    body("inv_thumbnail")
    .trim()
    .matches(/^\/images\/vehicles\/[a-zA-Z0-9\-_]+\.([a-zA-Z]{3,4})$/)
    .withMessage("Please provide an thumbnail image path ex.\/images\/vehicles\/example.png"),

    body("inv_price")
    .trim()
    // .isNumeric()
    .matches(/^\d+(\.\d{1,2})?$/)
    .withMessage("Please input valid price"),

    body("inv_miles")
    .trim()
    .isNumeric({ no_symbols: true })
    .withMessage("Please input miles without commas or decimals"),

    body("inv_color")
    .trim()
    .escape()
    // .isLength({ min: 1 })
    .isAlpha()
    .withMessage("Please provide a valid color"),
  ]
}

/* ******************************
 * Check vehicle data and return errors or continue to vehicle edit
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classSelect = await utilities.getClassSelect(classification_id)
    res.render("./inventory/addvehicle", {
      errors,
      title: "Add Vehicle",
      nav,
      classSelect,
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_miles, 
      inv_color
    })
    return
  }
  next()
}

/* ******************************
 * Check UPDATED vehicle data and return errors or continue to edit
 * ***************************** */
validate.checkVehicleUpdateData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body
  let name = `${inv_make} ${inv_model}`
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classSelect = await utilities.getClassSelect(classification_id)
    res.render("./inventory/editvehicle", {
      errors,
      title: `Edit ${name}`,
      nav,
      classSelect,
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_miles, 
      inv_color,
      inv_id
    })
    return
  }
  next()
}

module.exports = validate