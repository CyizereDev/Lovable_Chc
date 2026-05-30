const { Schema, model } = require('mongoose');
module.exports = model('StockTransaction', new Schema({
  productCode: { type: String, required: true },
  warehouseCode: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  quantityMoved: { type: Number, required: true },
  transactionType: { type: String, enum: ['IN','OUT'], required: true },
}, { timestamps: true }));
