const pool = require("../database")

const reviewsModel = {}

/* **********************
 * Add a new review with enhanced error handling
 ************************/
reviewsModel.addReview = async function (inv_id, account_id, review_text, rating) {
  try {
    // First check if user has already reviewed this vehicle
    const checkSql = `
      SELECT review_id FROM vehicle_reviews 
      WHERE inv_id = $1 AND account_id = $2`
    const checkResult = await pool.query(checkSql, [inv_id, account_id])
    
    if (checkResult.rowCount > 0) {
      throw {
        code: 'DUPLICATE_REVIEW',
        message: 'You have already reviewed this vehicle'
      }
    }

    // Proceed with adding the review
    const sql = `
      INSERT INTO vehicle_reviews (inv_id, account_id, review_text, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING review_id, created_at`
    const result = await pool.query(sql, [inv_id, account_id, review_text, rating])
    
    if (result.rowCount) {
      return result.rows[0]
    } else {
      throw {
        code: 'INSERT_ERROR',
        message: 'Error adding review'
      }
    }
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      throw {
        code: 'INVALID_REFERENCE',
        message: 'Invalid vehicle or account reference'
      }
    }
    throw error
  }
}

/* **********************
 * Get reviews with error handling and pagination
 ************************/
reviewsModel.getReviewsByVehicle = async function (inv_id, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    const sql = `
      SELECT r.*, 
             a.account_firstname, 
             a.account_lastname,
             TO_CHAR(r.created_at, 'MM/DD/YYYY') AS review_date
      FROM vehicle_reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3`
    
    const result = await pool.query(sql, [inv_id, limit, offset])
    return result.rows
  } catch (error) {
    console.error('Database error:', error)
    throw {
      code: 'DB_ERROR',
      message: 'Error retrieving reviews'
    }
  }
}

/* **********************
 * Get average rating with data validation
 ************************/
reviewsModel.getAverageRating = async function (inv_id) {
  try {
    const sql = `
      SELECT 
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) as review_count,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
      FROM vehicle_reviews
      WHERE inv_id = $1`
    
    const result = await pool.query(sql, [inv_id])
    if (!result.rows[0].average_rating) {
      return {
        average_rating: 0,
        review_count: 0,
        rating_distribution: {
          5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        }
      }
    }
    return {
      ...result.rows[0],
      rating_distribution: {
        5: result.rows[0].five_star_count,
        4: result.rows[0].four_star_count,
        3: result.rows[0].three_star_count,
        2: result.rows[0].two_star_count,
        1: result.rows[0].one_star_count
      }
    }
  } catch (error) {
    console.error('Database error:', error)
    throw {
      code: 'DB_ERROR',
      message: 'Error calculating average rating'
    }
  }
}