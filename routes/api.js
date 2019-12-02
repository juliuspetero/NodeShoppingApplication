const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const XentePaymentGateway = require('xente-node-sdk');
// Create authentication credential object
const authCredential = {
  apikey: '6A19EA2A706041A599375CC95FF08809',
  password: 'Demo123456',
  mode: 'sandbox'
};

// Initialize xente payment class
const xentePaymentGateway = new XentePaymentGateway(authCredential);

// Custom modules
const User = require('../models/user');
const Event = require('../models/product');
const Transaction = require('../models/transaction');

// Connection string attainable from MongODb website
const connectionString =
  'mongodb+srv://JuliusPetero:kyambogo45JP@@eventcluster-bhhfi.mongodb.net/EventsDb?retryWrites=true&w=majority';

// Connect to the database
mongoose.connect(
  connectionString,
  // This is for backward compartibility
  { useNewUrlParser: true, useUnifiedTopology: true },
  error => {
    if (error) {
      console.log(error);
    } else {
      console.log('Connected to MongoDb');
    }
  }
);

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({
      status: 'Unauthorized request'
    });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (token == null) {
    return res.status(401).send({
      status: 'Unauthorized request'
    });
  }

  try {
    const payload = jwt.verify(token, 'secretKey');
    // Add user Id as a property
    req.body.userId = payload.subject;
  } catch (error) {
    return res.status(401).send({
      status: 'The provided token is incorrect'
    });
  }
  next();
}

router.get('/', (req, res) => {
  res.send('From API Route');
});

// Register the user the user to the database
router.post('/register', (req, res) => {
  let userData = req.body;
  userData.id = uuid.v4();

  User.findOne({ email: userData.email }, (error, user) => {
    // In case of error with Mongo
    if (error) {
      console.log(error);
      res.status(500).send({
        status: 'Problem with system try again later'
      });
    } else {
      if (user) {
        res.status(400).send({
          status: 'The user with that email already exist'
        });
      } else {
        // Register the new user in the database
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(userData.password, salt);
        userData.password = hashPassword;

        // Create a new user with a hash password
        const user = new User(userData);

        user.save((error, registeredUser) => {
          if (error) {
            // console.error(error);
          } else {
            // For successfull registration
            const payload = {
              subject: registeredUser.id
            };
            const token = jwt.sign(payload, 'secretKey');
            res.status(200).send({
              token,
              phone: registeredUser.phone,
              email: registeredUser.email,
              status: 'Registration Successful'
            });
          }
        });
      }
    }
  });
});

// Login a user to access a token
router.post('/login', (req, res) => {
  const userData = req.body;
  User.findOne({ email: userData.email }, (error, user) => {
    // In case of error with Mongo
    if (error) {
      console.log(error);
      // No errror occured
    } else {
      // No user found with that email
      if (!user) {
        res.status(401).send({ status: 'Invalid Email' });

        // User found but the passwords do not match
      } else if (!bcrypt.compareSync(userData.password, user.password)) {
        res.status(401).send({ status: 'Invalid Password' });

        // The user is found and the password match
      } else {
        // For successfull login
        const payload = {
          subject: user._id
        };
        const token = jwt.sign(payload, 'secretKey');
        res.status(200).send({
          token,
          email: user.email,
          phone: user.phone,
          status: 'successful login'
        });
      }
    }
  });
});

//#region Get all the regular events
router.get('/events', (req, res) => {
  Event.find((error, response) => {
    if (error) {
      res.status(500).send({
        status: 'Error retrieving events from the database'
      });
    } else {
      res.json(response);
    }
  });
});
//#endregion

//#region Get all the special events
router.get('/userevents', verifyToken, (req, res) => {
  const currentUserId = req.body.userId;
  Event.find({ userId: currentUserId }, (error, response) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        status: 'Error fetchin user events from the database'
      });
    } else {
      res.json(response);
    }
  });
});
//#endregio

// Add event to the database
router.post('/add', verifyToken, (req, res) => {
  let eventData = req.body;
  eventData.id = uuid.v4();
  // console.log(eventData);
  const event = new Event(eventData);
  event.save((error, addedEvent) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        status: 'Error adding event to the database'
      });
    } else {
      res.status(201).send(addedEvent);
    }
  });
});

router.post('/pay', verifyToken, (req, res) => {
  const paymenRequestBody = req.body;
  let paymentProvider;
  if (
    paymenRequestBody.phone.startsWith('+25678') ||
    paymenRequestBody.phone.startsWith('+25677')
  ) {
    paymentProvider = 'MTNMOBILEMONEYUG';
  }

  // Create payment object
  const transactionRequest = {
    paymentProvider: 'MTNMOBILEMONEYUG',
    amount: paymenRequestBody.amount,
    message: `${paymenRequestBody.reason} for ${paymenRequestBody.eventId}`,
    customerId: paymenRequestBody.userId,
    customerPhone: paymenRequestBody.phone,
    customerEmail: paymenRequestBody.email,
    customerReference: paymenRequestBody.phone,
    // metadata: 'More information about the transaction',
    batchId: 'Batch001',
    requestId: uuid.v4()
  };

  // Create Transaction and handle promise response
  xentePaymentGateway.transactions
    .createTransaction(transactionRequest)
    .then(response => {
      // Create a transaction record to be locally stored in the database
      const newTransaction = {
        id: response.data.transactionId,
        eventId: paymenRequestBody.eventId,
        userId: transactionRequest.customerId,
        requestId: transactionRequest.requestId,
        createdOn: response.data.createdOn,
        status: response.data.message,
        batchId: transactionRequest.batchId,
        amount: transactionRequest.amount,
        paymentProvider: transactionRequest.paymentProvider,
        message: transactionRequest.message,
        userEmail: transactionRequest.customerEmail,
        transactionStatus: 'PROCESSING'
      };

      //Check if the transaction with this event is present in the database
      // Then remove it
      Transaction.find(
        { eventId: paymenRequestBody.eventId },
        (error, transaction) => {
          if (error) {
            console.log(error);
            res.status(500).send({
              status: error.message
            });
          }
          if (transaction != null) {
            Transaction.deleteMany({ eventId: paymenRequestBody.eventId });
            console.log('Transaction remove');
          }
        }
      );

      // Save the transaction details to the database
      const transaction = new Transaction(newTransaction);
      transaction.save((error, savedTransaction) => {
        if (error) {
          console.log(error);
          res.status(500).send({
            status:
              'Transaction was successfull but was not saved in the database'
          });
        } else {
          // Update the events collection
          Event.updateOne(
            { id: paymenRequestBody.eventId },
            { transactionId: savedTransaction.id },
            (error, updatedEvent) => {
              if (error) {
                console.log(error.message);
                res.status(500).send({
                  status: error.message
                });
              } else {
                console.log(updatedEvent);
                console.log(savedTransaction);
                res.status(201).send(savedTransaction);
              }
            }
          );
        }
      });
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({
        status: `Transaction was not successful ${error.message}`
      });
    });
});

// Get the transaction status of the transaction for a specific event
router.get('/status', verifyToken, (req, res) => {
  Transaction.findOne({ eventId: req.query.id }, (error, transaction) => {
    if (error) {
      console.log(error);
      res.status(500).send({
        status: 'Error while retrieving the transaction from the database'
      });

      // Transaction has not been created yet for this event
    } else if (transaction == null) {
      res.status(400).send({
        status:
          'Transaction has not yet been created for event, please create one'
      });
    }
    // Transaction has been found
    else if (
      !transaction.status.toLowerCase().includes('PROCESSING'.toLowerCase())
    ) {
      res.status(200).send({
        status: transaction.status
      });

      // Make request to xente to find out how far
    } else {
      xentePaymentGateway.transactions
        .getTransactionDetailsById(transaction.id)
        .then(response => {
          Transaction.updateOne(
            { id: response.data.transactionId },
            { status: response.data.status },
            (error, updatedTransaction) => {
              res.status(200).send({
                status: updatedTransaction.status
              });
            }
          );
        })
        .catch(error => {
          res.status(500).send({
            status: error.message
          });
        });
    }
  });
});

module.exports = router;
