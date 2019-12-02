const User = require('../models/user');

class UserRepository {
  constructor() {}
  createUser(newUser) {}

  async getAllUsers() {
    return await User.find();
  }

  async getUserById(userId) {
    return await User.findOne({ id: userId });
  }

  async deleteUser(userId) {
    return await User.findOneAndRemove({ id: userId });
  }

  async getNumberOfUsers() {
    return await User.countDocuments({});
  }

  async updateUserById(update) {
    return await User.findOneAndUpdate({ id: update.id }, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  }
}

module.exports = new UserRepository();
