const express = require('express');
const router = express.Router();

const accountController = require('../controllers/accountController');

router.post('/register', (req, res) => accountController.register(req, res));
router.post('/login', (req, res) => accountController.login(req, res));

module.exports = router;
