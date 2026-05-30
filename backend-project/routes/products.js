const r = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

r.get('/', auth, async (_q, res) => res.json(await Product.find().sort({ dateReceived: -1 })));
r.post('/', auth, async (req, res) => {
  try { await Product.create(req.body); res.json({ message: 'Product added' }); }
  catch (e) { res.status(400).json({ message: e.code===11000?'Code exists':e.message }); }
});
module.exports = r;
