const { Schema, model } = require('mongoose');
module.exports = model('Product', new Schema({
  productCode: { type: String, unique: true, required: true },
  productName: { type: String, required: true },
  category: String,
  quantityInStock: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 },
  supplierName: String,
  dateReceived: Date,
}, { timestamps: true }));
