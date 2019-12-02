const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transactionController');
const accountController = require('../controllers/accountController');

router.get('/', accountController.verifyToken, (req, res) =>
  transactionController.getAllTransactions(req, res)
);

router.get('/transactionid/:id', accountController.verifyToken, (req, res) =>
  transactionController.getTransactionById(req, res)
);

router.get('/requestid/:id', accountController.verifyToken, (req, res) =>
  transactionController.getTransactionByRequestId(req, res)
);

router.get('/accountid/:id', accountController.verifyToken, (req, res) =>
  transactionController.getAccountDetailsById(req, res)
);

router.get('/updateaccount/:id', accountController.verifyToken, (req, res) => {
  transactionController.updateAccountDetails(req, res);
});

router.get('/paymentproviders', accountController.verifyToken, (req, res) => {
  transactionController.getAllPaymentProviders(req, res);
});

// Get the number of transactions
router.get('/count', accountController.verifyToken, (req, res) => {
  transactionController.getNumberOfTransactions(req, res);
});

router.get(
  '/updatepaymentproviders',
  accountController.verifyToken,
  (req, res) => {
    transactionController.updatePaymentProviders(req, res);
  }
);

module.exports = router;
