const Transaction = require('../models/transaction');
const Account = require('../models/account');
const PaymentProvider = require('../models/paymentProvider');

class TransactionRepository {
  saveNewTransactionToDb(newTransaction, order, request) {
    const createdTransaction = {
      id: newTransaction.data.transactionId,
      userId: order.userId,
      requestId: newTransaction.data.requestId,
      createdOn: newTransaction.data.createdOn,
      status: 'PROCESSING',
      batchId: newTransaction.data.batchId,
      amount: order.totalAmount,
      paymentProvider: request.paymentProvider,
      userEmail: order.email,
      orderId: order.id,
      phone: request.customerReference
    };
    return new Promise((resolve, reject) => {
      const transaction = new Transaction(createdTransaction);
      transaction.save((error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
      //
    });
  }

  // Update transaction status attained from Xente
  updateTransactionStatus(transactionId, transactionStatus) {
    return new Promise((resolve, reject) => {
      Transaction.findOneAndUpdate(
        { id: transactionId },
        { status: transactionStatus },
        { new: true },
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  // Get all transactions
  async FindAllTransactions() {
    return await Transaction.find()
      .sort({ createdOn: -1 })
      .exec();
  }

  // Find transaction by its ID
  async findTransactionById(transactionId) {
    return await Transaction.findOne({ id: transactionId });
  }

  // Find transaction by Request Id
  async findTransactionRequestId(requestId) {
    return await Transaction.findOne({ requestId });
  }

  // Get an account with a specific ID
  async getAccountDetails(accountId) {
    return await Account.findOne({ accountId });
  }

  // Update or create a new account details document
  async updateAccountDetails(accountDetails) {
    return await Account.findOneAndUpdate(
      { accountId: accountDetails.accountId },
      accountDetails,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Retrieve all the payment provider from the underlying DB
  async getAllPaymentProviders() {
    return await PaymentProvider.find();
  }

  // Update or create new payments provider documents
  async updatePaymentProviders(paymentProviders) {
    let result = [];

    return new Promise((resolve, reject) => {
      paymentProviders.forEach(provider => {
        PaymentProvider.findOneAndUpdate(
          { paymentItemId: provider.paymentItemId },
          provider,
          { upsert: true, new: true, setDefaultsOnInsert: true },
          (error, response) => {
            if (error) {
              reject(error);
            } else {
              result.push(response);
              if (result.length == paymentProviders.length) {
                resolve(result);
              }
            }
          }
        );
      });
    });
  }

  async getNumberOfTransactions() {
    return await Transaction.countDocuments({});
  }
}

module.exports = new TransactionRepository();
