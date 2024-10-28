const reviewsModel = require("../models/reviews-model")
const inventoryModel = require("../models/inventory-model")
const utilities = require("../utilities")

const reviewsController = {}

/* ***************************
 *  Build vehicle reviews view
 * ************************** */
reviewsController.getVehicleReviews = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  if (!inv_id) {
    return next(new Error("Invalid vehicle ID"))
  }

  try {
    // Get vehicle details
    const vehicle = await inventoryModel.getInventoryByInvId(inv_id)
    if (!vehicle) {
      return next(new Error("Vehicle not found"))
    }

    // Get reviews and average rating
    const [reviews, stats] = await Promise.all([
      reviewsModel.getReviewsByVehicle(inv_id),
      reviewsModel.getAverageRating(inv_id)
    ])

    const nav = await utilities.getNav()
    
    // Check if logged-in user has already reviewed
    const hasReviewed = req.session.accountId ? 
      reviews.some(review => review.account_id === req.session.accountId) : 
      false

    res.render("./reviews/vehicle-reviews", {
      title: `Reviews for ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      reviews,
      averageRating: stats.average_rating || 0,
      reviewCount: stats.review_count || 0,
      hasReviewed,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process new review
 * ************************** */
reviewsController.addReview = async function (req, res, next) {
  try {
    // Get inv_id from body instead of params
    const { inv_id, review_text, rating } = req.body
    const account_id = req.session.accountId

    console.log('Review Data:', { inv_id, review_text, rating, account_id }) // Debug log

    // Validate inputs
    let errors = []
    if (!review_text || review_text.length < 10) {
      errors.push("Review must be at least 10 characters long")
    }
    if (!rating || rating < 1 || rating > 5) {
      errors.push("Rating must be between 1 and 5")
    }

    if (errors.length) {
      // Get all the data needed for the vehicle view
      const [data, reviews, stats] = await Promise.all([
        inventoryModel.getInventoryByInvId(inv_id),
        reviewsModel.getReviewsByVehicle(inv_id),
        reviewsModel.getAverageRating(inv_id)
      ])

      const grid = await utilities.buildVehicleGrid(data)
      const nav = await utilities.getNav()
      const vehicleMake = data[0].inv_make
      const vehicleModel = data[0].inv_model
      const vehicleYear = data[0].inv_year

      // Get account data for the review form
      const accountId = req.session.accountId || (res.locals.accountData ? res.locals.accountData.account_id : null)
      const accountType = req.session.accountType || (res.locals.accountData ? res.locals.accountData.account_type : null)

      return res.render("./inventory/vehicle", {
        title: vehicleYear + ' ' + vehicleMake + ' ' + vehicleModel,
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
    }

    // Add the review
    await reviewsModel.addReview(inv_id, account_id, review_text, rating)
    req.flash("success", "Review added successfully!")
    
    // Redirect back to the vehicle detail page
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    if (error.message.includes("already reviewed")) {
      req.flash("notice", "You have already reviewed this vehicle")
      return res.redirect(`/inv/detail/${inv_id}`)
    } else {
      next(error)
    }
  }
}
/* ***************************
 *  Build user reviews view
 * ************************** */
reviewsController.getUserReviews = async function (req, res, next) {
  const account_id = req.session.accountId
  
  try {
    const reviews = await reviewsModel.getReviewsByUser(account_id)
    const nav = await utilities.getNav()

    res.render("./account/user-reviews", {
      title: "Your Reviews",
      nav,
      reviews,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Process review update
 * ************************** */
reviewsController.updateReview = async function (req, res, next) {
  const { review_id, review_text, rating } = req.body
  const account_id = req.session.accountId

  // Validate inputs
  let errors = []
  if (!review_text || review_text.length < 10) {
    errors.push("Review must be at least 10 characters long")
  }
  if (!rating || rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5")
  }

  if (errors.length) {
    req.flash("error", errors)
    return res.redirect("/account/reviews")
  }

  try {
    const updatedReview = await reviewsModel.updateReview(
      review_id, 
      account_id, 
      review_text, 
      rating
    )
    req.flash("notice", "Review updated successfully!")
    res.redirect("/account/reviews")
  } catch (error) {
    if (error.message.includes("not authorized")) {
      req.flash("notice", "You are not authorized to update this review")
      res.redirect("/account/reviews")
    } else {
      next(error)
    }
  }
}

/* ***************************
 *  Process review deletion
 * ************************** */
reviewsController.deleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const account_id = req.session.accountId

  try {
    await reviewsModel.deleteReview(review_id, account_id)
    req.flash("notice", "Review deleted successfully!")
    res.redirect("/account/reviews")
  } catch (error) {
    if (error.message.includes("not authorized")) {
      req.flash("notice", "You are not authorized to delete this review")
      res.redirect("/account/reviews")
    } else {
      next(error)
    }
  }
}

/* ***************************
 *  Return JSON review data for AJAX updates
 * ************************** */
reviewsController.getReviewJSON = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const account_id = req.session.accountId

  try {
    const reviews = await reviewsModel.getReviewsByUser(account_id)
    const review = reviews.find(r => r.review_id === review_id)
    
    if (!review) {
      return res.status(404).json({ error: "Review not found" })
    }
    
    res.json(review)
  } catch (error) {
    next(error)
  }
}

module.exports = reviewsController