const userRepository = require('../repositories/userRepository');
const mongoose = require('mongoose');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

class UserController {
  createUser(req, res) {
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
              res.send(registeredUser);
            }
          });
        }
      }
    });
  }

  // Get all the users of the application
  getAllUsers(req, res) {
    userRepository
      .getAllUsers()
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  // Get a user by their ID
  getUserById(req, res) {
    userRepository
      .getUserById(req.params.id)
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  // Delete a particular user
  deleteUser(req, res) {
    userRepository
      .deleteUser(req.params.id)
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }

  getNumberOfUsers(req, res) {
    userRepository
      .getNumberOfUsers()
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

  // Update a user
  updateUserById(req, res) {
    userRepository
      .updateUserById(req.body)
      .then(response => {
        console.log(response);
        res.send(response);
      })
      .catch(error => {
        res.send({
          status: error.message
        });
      });
  }
}

module.exports = new UserController();
