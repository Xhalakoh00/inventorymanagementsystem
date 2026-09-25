const express = require('express');
const router = express.Router();

const userController = require('../Controller/UserController');

// Define the routes
router.post('/createuser', userController.createUser);
router.post('/loginuser', userController.loginUser);

// Export the router to be used in other files
module.exports = router;

