const express = require('express');
const router = express.Router();
const saleController = require('../controller/SalesController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Cashiers and Admins can create sales
router.post('/create', verifyToken, saleController.createSale);

// View sales history
router.get('/all', verifyToken, saleController.getAllSales);

module.exports = router;