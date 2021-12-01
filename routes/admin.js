const express = require('express');

const productController = require('../controllers/products');

const router = express.Router();

router.post('/addProduct', productController.addProducts);

router.post('/editProduct', productController.editProduct);

router.post('/deleteProduct', productController.deleteProduct);

module.exports = router;