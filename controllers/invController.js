const invModel = require("../models/inventory-model")
const reviewsModel = require("../models/reviews-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId
    
    // Get account ID from either session or JWT data
    const accountId = req.session.accountId || (res.locals.accountData ? res.locals.accountData.account_id : null)
    const accountType = req.session.accountType || (res.locals.accountData ? res.locals.accountData.account_type : null)

    // Get vehicle data and review data in parallel
    const [data, reviews, stats] = await Promise.all([
      invModel.getInventoryByInvId(inv_id),
      reviewsModel.getReviewsByVehicle(inv_id),
      reviewsModel.getAverageRating(inv_id)
    ])

    if (!data || !data[0]) {
      req.flash("notice", "Sorry, we couldn't find that vehicle")
      return res.redirect("/inv")
    }

    const grid = await utilities.buildVehicleGrid(data)
    let nav = await utilities.getNav()
    const vehicleMake = data[0].inv_make
    const vehicleModel = data[0].inv_model
    const vehicleYear = data[0].inv_year

    // Check if logged-in user has already reviewed using accountId
    const hasReviewed = accountId ? 
      reviews.some(review => review.account_id === parseInt(accountId)) : 
      false

    // view -- vehicle.ejs
    res.render("./inventory/vehicle", {
      title: vehicleYear + ' ' + vehicleMake + ' ' + vehicleModel,
      nav,
      grid,
      inv_id, // Pass inv_id directly
      reviews,
      averageRating: stats.average_rating || 0,
      reviewCount: stats.review_count || 0,
      hasReviewed,
      accountId,
      accountType,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Deliver addclass view
 * ************************** */
invCont.buildAddclass = async function (req, res, next) {
  let nav = await utilities.getNav()
  // view -- addclass.ejs
  res.render("./inventory/addclass", {
    title: 'Add Classification',
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process addclass info
* *************************************** */
invCont.addClass = async function (req, res, next) {
  const { classification_name } = req.body

  const regResult = await invModel.addClass(
    classification_name
  )
  let nav = await utilities.getNav()
  let classSelect = await utilities.getClassSelect()

  if (regResult) {
    req.flash(
      "success",
      "Classification added"
    )
    res.status(200).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classSelect,
    })
  } else {
    req.flash("error", "Class addition failed")
    res.status(501).render("./inventory/addclass", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Deliver addvehicle view
 * ************************** */
invCont.buildAddvehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classSelect = await utilities.getClassSelect()
  // view -- addvehicle.ejs
  res.render("./inventory/addvehicle", {
    title: 'Add Vehicle',
    nav,
    errors: null,
    classSelect,
  })
}

/* ****************************************
*  Process vehicle info
* *************************************** */
invCont.addVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classSelect = await utilities.getClassSelect()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

  const regResult = await invModel.addVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  if (regResult) {
    req.flash(
      "success",
      "Vehicle added"
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classSelect,
    })
  } else {
    req.flash("error", "Vehicle addition failed")
    res.status(501).render("./inventory/addvehicle", {
      title: "Add Vehicle",
      nav,
      classSelect,
      errors: null,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Deliver editvehicle view with current vehicle data
 * ************************** */
invCont.buildVehicleEdit = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)
  let invData = (await invModel.getInventoryByInvId(inv_id))[0]
  let classSelect = await utilities.getClassSelect(invData.classification_id)
  let name = `${invData.inv_make} ${invData.inv_model}`
  // view -- editvehicle.ejs
  res.render("./inventory/editvehicle", {
    title: "Edit " + name,
    nav,
    errors: null,
    classSelect: classSelect,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    inv_id: invData.inv_id,
  })
}

/* ****************************************
*  Process updated vehicle info
* *************************************** */
invCont.updateVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    classification_id,
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
  } = req.body

  const updateResult = await invModel.updateVehicle(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
    const classSelect = await utilities.getClassSelect(classification_id)

    req.flash("success", `${itemName} was successfully updated`)
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classSelect,
    })
  } else {
    const classSelect = await utilities.getClassSelect(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the insert failed.")
    res.status(501).render("./inventory/editvehicle", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      classSelect: classSelect,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      inv_id,
    })
  }
}

/* ***************************
 *  Deliver deleteconfirm view with vehicle data
 * ************************** */
invCont.buildVehicleDeleteConfirm = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)
  let invData = (await invModel.getInventoryByInvId(inv_id))[0]
  let name = `${invData.inv_make} ${invData.inv_model}`
  // view -- addvehicle.ejs
  res.render("./inventory/deleteconfirm", {
    title: `Delete ${name}`,
    nav,
    errors: null,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_price: invData.inv_price,
    inv_id: invData.inv_id,
  })
}

/* ****************************************
*  Confirm and process vehicle deletion
* *************************************** */
invCont.deleteVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classSelect = await utilities.getClassSelect()
  const { inv_make, inv_model, inv_year, inv_id } = req.body
  const name = `${inv_make} ${inv_model}`
  const deleteResult = await invModel.deleteVehicle(inv_id)

  if (deleteResult) {
    // const name = `${inv_make} ${inv_model}`
    req.flash("success", `${name} was successfully deleted`)
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classSelect,
    })
  } else {
    // const name = `${inv_make} ${inv_model}`
    req.flash("error", "Sorry, the deletion failed.")
    res.status(501).render("./inventory/deleteconfirm", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_id,
    })
  }
}

module.exports = invCont