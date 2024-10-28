const pool = require("../database")

const reviewsModel = {}

/* **********************
 * Add a new review
 ************************/
reviewsModel.addReview = async function (inv_id, account_id, review_text, rating) {
  try {
    const sql = `
      INSERT INTO vehicle_reviews (inv_id, account_id, review_text, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *`
    const result = await pool.query(sql, [inv_id, account_id, review_text, rating])
    return result.rows[0]
  } catch (error) {
    if (error.constraint === 'unique_user_review') {
      throw new Error('You have already reviewed this vehicle')
    }
    throw error
  }
}

/* **********************
 * Get all reviews for a vehicle
 ************************/
reviewsModel.getReviewsByVehicle = async function (inv_id) {
  try {
    const sql = `
      SELECT r.*, 
             a.account_firstname, 
             a.account_lastname,
             TO_CHAR(r.created_at, 'MM/DD/YYYY') AS review_date
      FROM vehicle_reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.created_at DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    throw error
  }
}

/* **********************
 * Get average rating for a vehicle
 ************************/
reviewsModel.getAverageRating = async function (inv_id) {
  try {
    const sql = `
      SELECT ROUND(AVG(rating)::numeric, 1) as average_rating,
             COUNT(*) as review_count
      FROM vehicle_reviews
      WHERE inv_id = $1`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* **********************
 * Get all reviews by a user
 ************************/
reviewsModel.getReviewsByUser = async function (account_id) {
  try {
    const sql = `
      SELECT r.*, 
             i.inv_make, 
             i.inv_model,
             i.inv_year,
             TO_CHAR(r.created_at, 'MM/DD/YYYY') AS review_date
      FROM vehicle_reviews r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.created_at DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    throw error
  }
}

/* **********************
 * Update a review
 ************************/
reviewsModel.updateReview = async function (review_id, account_id, review_text, rating) {
  try {
    const sql = `
      UPDATE vehicle_reviews
      SET review_text = $1, 
          rating = $2
      WHERE review_id = $3 
      AND account_id = $4
      RETURNING *`
    const result = await pool.query(sql, [review_text, rating, review_id, account_id])
    if (result.rowCount === 0) {
      throw new Error("Review not found or user not authorized")
    }
    return result.rows[0]
  } catch (error) {
    throw error
  }
}

/* **********************
 * Delete a review
 ************************/
reviewsModel.deleteReview = async function (review_id, account_id) {
  try {
    const sql = `
      DELETE FROM vehicle_reviews
      WHERE review_id = $1 
      AND account_id = $2
      RETURNING *`
    const result = await pool.query(sql, [review_id, account_id])
    if (result.rowCount === 0) {
      throw new Error("Review not found or user not authorized")
    }
    return true
  } catch (error) {
    throw error
  }
}

module.exports = reviewsModel