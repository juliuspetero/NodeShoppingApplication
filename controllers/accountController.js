const mongoose = require('mongoose');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

class AccountController {
  constructor() {}

  // REGISTER A NEW USER
  register(req, res) {
    let newUser = req.body;
    User.findOne({ email: newUser.email }, async (error, user) => {
      // In case of error with Mongo
      if (error) {
        console.log(error);
        res.status(500).send({
          status: 'Problem with system try again later'
        });
      } else {
        if (user) {
          res.status(400).send({
            status: `The user with email address ${newUser.email} already exist`
          });
        } else {
          // Register the new user in the database
          const salt = await bcrypt.genSalt(10);
          const hashPassword = await bcrypt.hash(newUser.password, salt);
          newUser.password = hashPassword;
          newUser.id = uuid
            .v4()
            .replace(/-/g, '')
            .slice(15);
          newUser.role = 'buyer';

          // Create a new user with a hash password
          const user = new User(newUser);

          // Handle the response with a callback
          user.save((error, registeredUser) => {
            if (error) {
              // console.error(error);
            } else {
              // For successfull registration
              const payload = {
                subject: registeredUser.id,
                role: registeredUser.role
              };
              const token = jwt.sign(payload, 'secretKey');
              res.status(200).send({
                token,
                phone: registeredUser.phone,
                email: registeredUser.email,
                role: newUser.role,
                status: 'Registration Successful'
              });
            }
          });
        }
      }
    });
  }

  // LOGIN A NEW USER
  async login(req, res) {
    const userData = req.body;
    User.findOne({ email: userData.email }, async (error, user) => {
      // In case of error with Mongo
      if (error) {
        console.log(error);
        res.status(500).send({
          status: 'Error retrieving details from the database'
        });
        // No errror occured
      } else {
        // No user found with that email
        if (!user) {
          res.status(401).send({ status: 'Invalid Email' });

          // User found but the passwords do not match
        } else if (!(await bcrypt.compare(userData.password, user.password))) {
          res.status(401).send({ status: 'Invalid Password' });

          // The user is found and the password match
        } else {
          // For successfull login
          const payload = {
            subject: user.id,
            role: user.role
          };
          const token = jwt.sign(payload, 'secretKey');
          res.status(200).send({
            token,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: 'successful login'
          });
        }
      }
    });
  }

  // VERIFY AUTH TOKEN
  verifyToken(req, res, next) {
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
      req.body.userRole = payload.role;
    } catch (error) {
      return res.status(401).send({
        status: 'The provided token is incorrect'
      });
    }
    next();
  }
}

module.exports = new AccountController();
