const express = require('express');
const router = express.Router();
const ReviewsController = require('../controllers/reviews.controllers');

// Route to add a review
router.post('/reviews/add', ReviewsController.addReview);

// Route to delete a review by ID
router.delete('/reviews/:id', ReviewsController.deleteReview);

module.exports = router;   