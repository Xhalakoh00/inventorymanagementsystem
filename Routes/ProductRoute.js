const express = require('express');
const router = express.Router();

// Import the product controller
const productController = require('../Controller/ProductController');

// Define the routes
router.post('/createproduct', productController.createProduct);
router.put('/updateproduct/:id', productController.updateProduct);

// Additional standard CRUD routes (if defined in your ProductController)
if (productController.getAllProducts) {
  router.get('/allproducts', productController.getAllProducts);
}
if (productController.getProductById) {
  router.get('/:id', productController.getProductById);
}
if (productController.deleteProduct) {
  router.delete('/deleteproduct/:id', productController.deleteProduct);
}

// Export the router to be used in other files
module.exports = router;
