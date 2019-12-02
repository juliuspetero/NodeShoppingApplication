const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const accountController = require('../controllers/accountController');

// Uploading File
const multer = require('multer');
const DIR = './assets/uploads';
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, DIR);
  },
  filename: (req, file, callback) => {
    callback(null, `${new Date().getTime().toString(36)}_${file.originalname}`);
  }
});
const upload = multer({ storage });

// Get all orders
router.get('/', (req, res, next) => productController.getAllProducts(req, res));

// Post a new product
router.post(
  '/',
  accountController.verifyToken,
  upload.single('photo'),
  (req, res) => productController.createProduct(req, res)
);

// Get product by a particular ID
router.get('/productid/:id', (req, res) =>
  productController.getProductById(req, res)
);

// Update an existing
router.put(
  '/:id',
  accountController.verifyToken,
  upload.single('photoFile'),
  (req, res) => productController.updateProduct(req, res)
);

// Delete product by product ID
router.delete('/:id', accountController.verifyToken, (req, res) =>
  productController.deleteProduct(req, res)
);

module.exports = router;
