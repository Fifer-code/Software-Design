//set up routes
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// import all exports from serviceController.js **MUST MATCH *
const { getService, createService, updateService } = require('../controllers/serviceController');

// gets information for all services
router.get('/', authenticateToken, authorizeRoles('user', 'admin'), getService);

// creates information for new service
router.post('/', authenticateToken, authorizeRoles('admin'), createService);

// updates a specific service
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateService);

module.exports = router;