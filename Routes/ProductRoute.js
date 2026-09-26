const express = require('express');
const router = express.Router();
const productController = require('../controller/ProductController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/all', productController.getAllProducts);

// ONLY Admins can create or delete products
router.post('/create', verifyToken, isAdmin, productController.createProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;