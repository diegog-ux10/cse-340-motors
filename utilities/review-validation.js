// utilities/review-validation.js
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // rating is required and must be between 1-5
    body("rating")
      .notEmpty()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),

    // review text is required and must be at least 10 characters
    body("review_text")
      .trim()
      .notEmpty()
      .withMessage("Review text is required")
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters")
      .escape(), // Prevent XSS

    // inv_id must exist and be numeric
    body("inv_id")
      .notEmpty()
      .withMessage("Vehicle ID is required")
      .isInt()
      .withMessage("Invalid vehicle ID")
  ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_text, rating } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const data = await inventoryModel.getInventoryByInvId(inv_id)
    if (!data || !data[0]) {
      req.flash("notice", "Sorry, we couldn't find that vehicle")
      return res.redirect("/inv")
    }
    const grid = await utilities.buildVehicleGrid(data)
    const [reviews, stats] = await Promise.all([
      reviewsModel.getReviewsByVehicle(inv_id),
      reviewsModel.getAverageRating(inv_id)
    ])
    const accountId = req.session.accountId || (res.locals.accountData ? res.locals.accountData.account_id : null)
    const accountType = req.session.accountType || (res.locals.accountData ? res.locals.accountData.account_type : null)

    res.render("./inventory/vehicle", {
      title: data[0].inv_year + ' ' + data[0].inv_make + ' ' + data[0].inv_model,
      nav,
      grid,
      inv_id,
      reviews,
      averageRating: stats.average_rating || 0,
      reviewCount: stats.review_count || 0,
      accountId,
      accountType,
      errors,
      hasReviewed: false
    })
    return
  }
  next()
}

module.exports = validate