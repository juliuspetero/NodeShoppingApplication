const Product = require('../models/product');

class ProductRepository {
  async getAllProducts(req, res) {
    return await Product.find();
  }

  async getProductById(productId) {
    return await Product.findOne({ id: productId });
  }

  async deleteProduct(productId) {
    return await Product.findOneAndRemove({ id: productId });
  }

  async updateProduct(productId, update) {
    return await Product.findOneAndUpdate(
      { id: productId },
      { $set: update },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
  }

  async createProduct(newProduct) {
    const product = new Product(newProduct);
    return await product.save();
  }
}

module.exports = new ProductRepository();
