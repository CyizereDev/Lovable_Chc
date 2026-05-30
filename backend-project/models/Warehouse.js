const { Schema, model } = require('mongoose');
module.exports = model('Warehouse', new Schema({
  warehouseCode: { type: String, unique: true, required: true },
  warehouseName: { type: String, required: true },
  warehouseLocation: { type: String, required: true },
}));
