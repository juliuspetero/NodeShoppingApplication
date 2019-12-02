const uuid = require('uuid');
const xenteTransactionRepository = require('../repositories/xenteTransactionRepository');
const orderRepository = require('../repositories/orderRepository');
const transactionRepository = require('../repositories/transactionRepository');

class OrderController {
  //#region CREATE A NEW ORDER
  createOrder(req, res) {
    const orderRequest = req.body;
    // Generate a unique order ID
    orderRequest.id = uuid
      .v4()
      .replace(/-/g, '')
      .slice(15);

    let paymentProvider = null;

    // Call a appropriate payment provider
    if (
      orderRequest.phone.startsWith('25678') ||
      orderRequest.phone.startsWith('25677')
    ) {
      paymentProvider = 'MTNMOBILEMONEYUG';
    } else if (
      orderRequest.phone.startsWith('25675') ||
      orderRequest.phone.startsWith('25670')
    ) {
      paymentProvider = 'AIRTELMONEYUG';
    } else {
      res.status(400).send({
        status: `Phone number ${orderRequest.phone} is not valid`
      });
    }

    // Create a transaction request object
    const transactionRequest = {
      paymentProvider,
      amount: orderRequest.totalAmount.toString(),
      message: `Payment for ${orderRequest.id}`,
      customerId: orderRequest.userId,
      customerPhone: orderRequest.phone,
      customerEmail: orderRequest.email,
      customerReference: orderRequest.phone,
      metadata: JSON.stringify({
        orderId: orderRequest.id,
        category: 'catalogItem'
      }),
      batchId: 'Batch001',
      requestId: uuid
        .v4()
        .replace(/-/g, '')
        .slice(15)
    };

    // Make request to Xente
    xenteTransactionRepository
      .createXenteTransaction(transactionRequest, orderRequest.applicationMode)
      .then(response => {
        // save the transaction to DB
        transactionRepository
          .saveNewTransactionToDb(response, orderRequest, transactionRequest)
          .then(transactionDbResponse => {
            // Save order to the database
            orderRepository
              .saveNewOrderToDb(orderRequest, transactionDbResponse)
              .then(orderDbResponse => {
                // Send the order to the user
                res.status(201).send(orderDbResponse);
              })
              .catch(error => {
                console.log(error);
                res.status(500).send({
                  status: 'Error saving order to the DB'
                });
              });
          })
          .catch(error => {
            console.log(error);
            res.status(500).send({
              status: 'Error saving transaction to the DB'
            });
          });
      })
      .catch(error => {
        // 404-notfound 50 0-internal 503-service unavailable
        console.log(error);
        res.status(500).send({
          status: 'Error from Xente API'
        });
      });
  }
  //#endregion

  getOrdersByUserId(req, res) {
    orderRepository
      .GetOrdersByUserId(req.body.userId)
      .then(userOrdersDbResponse => {
        res.status(200).send(userOrdersDbResponse);
      })
      .catch(error => {
        console.log(error);
        res.status(500).send({
          status: 'Error while fetching user orders'
        });
      });
  }

  updateOrderTransactionDetails(req, res) {
    // Retrieve transaction ID from DB
    orderRepository
      .GetOrderById(req.params.id)
      .then(orderDbResponse => {
        // Make API request to get the recent transaction details by ID
        if (orderDbResponse == null) {
          res.send({
            status: 'Invalid order ID provided'
          });
        }

        // console.log(orderDbResponse.transactionId);
        xenteTransactionRepository
          .getXenteTransactionDetailsById(
            orderDbResponse.transactionId,
            orderDbResponse.applicationMode
          )
          .then(transactionDetailsResponse => {
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
                    req.params.id,
                    transactionDbResponse.status
                  )
                  .then(updatedOrderDbResponse => {
                    res.status(200).send(updatedOrderDbResponse);
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
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: error.message
        });
      });
  }

  // Get all orders from the Db
  getAllOrders(req, res) {
    orderRepository
      .getAllOrders()
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  // Get orders count
  getNumberOfOrders(req, res) {
    orderRepository
      .getNumberOfOrders()
      .then(response => {
        res.send({
          count: response
        });
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  getOrderById(req, res) {
    res.send(req.params.id);
  }
}

module.exports = new OrderController();
