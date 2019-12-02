const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const accountController = require('../controllers/accountController');

router.post('/', accountController.verifyToken, (req, res) =>
  orderController.createOrder(req, res)
);

// Get orders made by a particular user
router.get('/userorders', accountController.verifyToken, (req, res) =>
  orderController.getOrdersByUserId(req, res)
);

router.get(
  '/transactionstatus/:id',
  accountController.verifyToken,
  (req, res) => orderController.updateOrderTransactionDetails(req, res)
);

// Get order by order ID
router.get('/orderid/:id', accountController.verifyToken, (req, res) =>
  orderController.getOrderById(req, res)
);

// Get all orders
router.get('/', accountController.verifyToken, (req, res) =>
  orderController.getAllOrders(req, res)
);

// Get orders count
router.get('/count', accountController.verifyToken, (req, res) =>
  orderController.getNumberOfOrders(req, res)
);

module.exports = router;
