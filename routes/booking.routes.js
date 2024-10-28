const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controllers');

router.post('/createBooking', BookingController.createBooking);
router.get('/getBookedTimes/:service_id/:date', BookingController.getBookedTimes);

module.exports = router;  