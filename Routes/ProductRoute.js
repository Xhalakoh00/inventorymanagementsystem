const express = require('express');
const router = express.Router();

//import the product controller
const productController = require('../controller/ProductController');

router.post('/', productController.createProduct);
router.post('/:id', productController.updateProduct);

