const uuid = require('uuid');
const fs = require('fs');

const productRepository = require('../repositories/productRepository');

class ProductController {
  // Retrieve all the products
  getAllProducts(req, res) {
    productRepository
      .getAllProducts()
      .then(response => {
        res.status(200).send(response);
      })
      .catch(error => {
        res.status(400).send({
          status: error.message
        });
      });
  }

  // Retrieve a product by ID
  getProductById(req, res) {
    productRepository
      .getProductById(req.params.id)
      .then(response => {
        res.status(200).send(response);
      })
      .catch(error => {
        status: error.message;
      });
  }

  // Create a new product with photo
  createProduct(req, res) {
    if (!req.file) {
      res.send({
        status: 'Error saving photo'
      });
    }

    // Add attribute to the product
    let newProduct = req.body;
    newProduct.id = uuid
      .v4()
      .replace(/-/g, '')
      .slice(15);
    newProduct.photo = req.file.filename;

    // Save to the database
    productRepository
      .createProduct(newProduct)
      .then(response => {
        res.send(response);
      })
      .catch(error => {
        res.status(400).send({
          status: error.messages
        });
      });
  }

  // Remove a product from the DB
  deleteProduct(req, res) {
    productRepository
      .deleteProduct(req.params.id)
      .then(response => {
        fs.unlink(`./assets/uploads/${response.photo}`, error => {
          if (error) {
            console.log(error);
          }
        });
        res.status(200).send(response);
      })
      .catch(error => {
        console.log(error);
        res.status(400).send({
          status: error.message
        });
      });
  }

  // Update the product from the DB
  async updateProduct(req, res) {
    if (req.file) {
      // Query the database to get previous photo name
      await productRepository.getProductById(req.params.id).then(response => {
        // Delete the photo
        fs.unlink(`./assets/uploads/${response.photo}`, error => {
          if (error) {
            console.log(error);
          }
        });
      });

      // Set the new file name for the photo created
      req.body.photo = req.file.filename;
    }
    // Update the the details for the product
    productRepository
      .updateProduct(req.params.id, req.body)
      .then(response => {
        // console.log(response);
        res.status(200).send(response);
      })
      .catch(error => {
        console.error(error);
        res.status(200).send({
          status: error.message
        });
      });
  }
}

module.exports = new ProductController();
