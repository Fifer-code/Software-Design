//set up routes
const express = require('express');
const router = express.Router();

// import all exports from serviceController.js **MUST MATCH *
const { getService, createService, updateService } = require('../controllers/serviceController');

// gets information for all services
router.get('/', getService);

// creates information for new service
router.post('/', createService);

// updates a specific service
router.put('/:id', updateService);

module.exports = router;