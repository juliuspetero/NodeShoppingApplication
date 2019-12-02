const xenteTransactionRepository = require('../repositories/xenteTransactionRepository');
const orderRepository = require('../repositories/orderRepository');
const transactionRepository = require('../repositories/transactionRepository');

class TransactionController {
  constructor() {}

  getAllTransactions(req, res) {
    transactionRepository
      .FindAllTransactions()
      .then(response => {
        res.status(200).send(response);
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: error.message
        });
      });
  }

  // Retrieve transaction wit a particular ID
  getTransactionById(req, res) {
    xenteTransactionRepository
      .getXenteTransactionDetailsById(req.params.id)
      .then(transactionDetailsResponse => {
        // console.log(transactionDetailsResponse);
        //Update Transaction DB
        transactionRepository
          .updateTransactionStatus(
            transactionDetailsResponse.data.transactionId,
            transactionDetailsResponse.data.status
          )
          .then(transactionDbResponse => {
            if (transactionDbResponse == null) {
              res.send({
                status: 'The transaction does not exist in the database'
              });
            }
            // Update order DB
            orderRepository
              .updateOrderPaymentStatus(
                transactionDbResponse.orderId,
                transactionDbResponse.status
              )
              .then(updatedOrderDbResponse => {
                res.status(200).send(transactionDbResponse);
              })
              .catch(error => {
                console.log(error);
                res.send({
                  status: error.message
                });
              });
          })
          .catch(error => {
            console.log(error);
            res.send({
              status: error.message
            });
          });
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: error.message
        });
      });
  }

  // Get transaction details using the request Id
  getTransactionByRequestId(req, res) {
    xenteTransactionRepository
      .getXenteTransactionDetailsByRequestId(req.params.id)
      .then(transactionDetailsResponse => {
        // console.log(transactionDetailsResponse);
        //Update Transaction DB
        transactionRepository
          .updateTransactionStatus(
            transactionDetailsResponse.data.transactionId,
            transactionDetailsResponse.data.status
          )
          .then(transactionDbResponse => {
            if (transactionDbResponse == null) {
              res.send({
                status: 'The transaction does not exist in the database'
              });
            }
            // Update order DB
            orderRepository
              .updateOrderPaymentStatus(
                transactionDbResponse.orderId,
                transactionDbResponse.status
              )
              .then(updatedOrderDbResponse => {
                res.status(200).send(transactionDbResponse);
              })
              .catch(error => {
                console.log(error);
                res.send({
                  status: error.message
                });
              });
          })
          .catch(error => {
            console.log(error);
            res.send({
              status: error.message
            });
          });
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: error.message
        });
      });
  }

  // Retrieve account details from the DB
  getAccountDetailsById(req, res) {
    transactionRepository
      .getAccountDetails(req.params.id)
      .then(response => {
        if (response != null) {
          res.send(response);
        } else {
          res.status(404).send({
            status: `Account with ${req.params.id} does not exists`
          });
        }
      })
      .catch(error => {
        res.status(500).send({
          status: error.message
        });
      });
  }

  // Update or add account details to the DB
  updateAccountDetails(req, res) {
    xenteTransactionRepository
      .getXenteAccountDetailsById(req.params.id)
      .then(response => {
        console.log(response);
        if (response.code == -1) {
          res.send({
            status: `Account with ID ${req.params.id} does not exist`
          });
        }
        // Save the response to the Db
        transactionRepository
          .updateAccountDetails(response.data)
          .then(response => {
            res.send(response);
          })
          .catch(error => {
            console.log(error);
            res.send({
              status: error.message
            });
          });
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: error.message
        });
      });
  }

  getAllPaymentProviders(req, res) {
    transactionRepository
      .getAllPaymentProviders()
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  updatePaymentProviders(req, res) {
    xenteTransactionRepository
      .GetXenteAllPaymentProviders()
      .then(response => {
        transactionRepository
          .updatePaymentProviders(response.data.collection)
          .then(response => {
            res.send(response);
          })
          .catch(error => {
            res.send({
              status: error.message
            });
          });
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  getNumberOfTransactions(req, res) {
    transactionRepository
      .getNumberOfTransactions()
      .then(response => {
        res.send({
          count: response
        });
      })
      .catch(error => {
        res.status(500).send({
          status: error.message
        });
      });
  }
}

module.exports = new TransactionController();
