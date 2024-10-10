// controllers/errorController.js
exports.triggerError = (req, res, next) => {
    // Intentionally throw an error
    const error = new Error('This is an intentional error');
    error.status = 500; // Set the status code
    throw error; // This will be caught by the error handling middleware
  };