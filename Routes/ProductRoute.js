const express = require('express');
const router = express.Router();
const productController = require('../controller/ProductController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Anyone logged in can view products
router.get('/all', verifyToken, productController.getAllProducts);

// ONLY Admins can create or delete products
router.post('/create', verifyToken, isAdmin, productController.createProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;