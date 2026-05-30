const r = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET all products
r.get('/', auth, async (_q, res) => {
  try {
    const products = await Product.find().sort({ dateReceived: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product by code
r.get('/:code', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ productCode: req.params.code });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new product
r.post('/', auth, async (req, res) => {
  try {
    const existingProduct = await Product.findOne({ productCode: req.body.productCode });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product code already exists' });
    }
    await Product.create(req.body);
    res.json({ message: 'Product added successfully' });
  } catch (e) {
    res.status(400).json({ message: e.code === 11000 ? 'Product code already exists' : e.message });
  }
});

// PUT update product by code
r.put('/:code', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { productCode: req.params.code },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product by code
r.delete('/:code', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ productCode: req.params.code });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = r;