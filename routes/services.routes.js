const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controllers')

router.post('/createServices', servicesController.createServices);
router.get('/getAllServices', servicesController.getAllServices);
router.delete('/deleteService/:id', servicesController.deleteService);


module.exports = router;