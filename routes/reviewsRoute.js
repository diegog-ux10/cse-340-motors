const express = require("express")
const router = new express.Router()
const reviewsController = require("../controllers/reviewsController")
const reviewValidate = require("../utilities/review-validation")
const { handleErrors, checkLogin } = require("../utilities")

// Route for adding a new review
router.post("/",
    checkLogin,
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    handleErrors(reviewsController.addReview)
)

// Other routes
router.put("/reviews/:review_id", checkLogin, handleErrors(reviewsController.updateReview))
router.delete("/reviews/:review_id", checkLogin, handleErrors(reviewsController.deleteReview))
router.get("/account/reviews", checkLogin, handleErrors(reviewsController.getUserReviews))

module.exports = router;