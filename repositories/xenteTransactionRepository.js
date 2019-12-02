const XentePayment = require('xente-node-sdk');

// Authentication configuration for sandbox
const authCredential = {
  apikey: '6A19EA2A706041A599375CC95FF08809',
  password: 'Demo123456',
  mode: 'sandbox'
};

const accountId = '256784378515';

class XenteTransactionRepository {
  constructor() {
    this.xentePaymentGateway = new XentePayment(authCredential);
  }

  createXenteTransaction(transactionRequest) {
    return new Promise((resolve, reject) => {
      this.xentePaymentGateway.transactions
        .createTransaction(transactionRequest)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  getXenteTransactionDetailsById(transactionId, applicationMode) {
    return new Promise((resolve, reject) => {
      this.xentePaymentGateway.transactions
        .getTransactionDetailsById(transactionId)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // Get transaction details by the request ID
  async getXenteTransactionDetailsByRequestId(requestId, applicationMode) {
    return await this.xentePaymentGateway.transactions.getTransactionDetailsByRequestId(
      requestId
    );
  }

  // Retrieve user account details from xente
  getXenteAccountDetailsById(accountId) {
    return new Promise((resolve, reject) => {
      this.xentePaymentGateway.accounts
        .getAccountDetailsById(accountId)
        .then(response => {
          console.log(response);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // Retrieve all the current payment providers
  GetXenteAllPaymentProviders() {
    return new Promise((resolve, reject) => {
      this.xentePaymentGateway.paymentProviders
        .getAllPaymentProviders()
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = new XenteTransactionRepository();
