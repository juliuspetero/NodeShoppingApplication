const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const accountController = require('../controllers/accountController');

router.post('/', accountController.verifyToken, (req, res) =>
  userController.createUser(req, res)
);

// Get orders made by a particular user
router.get('/', accountController.verifyToken, (req, res) =>
  userController.getAllUsers(req, res)
);

// Get user by their ID
router.get('/userid/:id', accountController.verifyToken, (req, res) =>
  userController.getUserById(req, res)
);

// Delete a user
router.delete('/:id', accountController.verifyToken, (req, res) =>
  userController.deleteUser(req, res)
);

// Get the number of registered users
router.get('/count', accountController.verifyToken, (req, res) =>
  userController.getNumberOfUsers(req, res)
);

router.put('/', accountController.verifyToken, (req, res) =>
  userController.updateUserById(req, res)
);

module.exports = router;
