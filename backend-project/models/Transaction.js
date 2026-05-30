const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    trim: true
  },
  warehouseCode: {
    type: String,
    required: [true, 'Warehouse code is required'],
    trim: true
  },
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
    default: Date.now
  },
  quantityMoved: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  transactionType: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['IN', 'OUT'],
      message: 'Transaction type must be either IN or OUT'
    }
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
transactionSchema.index({ transactionDate: -1 });
transactionSchema.index({ productCode: 1, transactionDate: -1 });
transactionSchema.index({ warehouseCode: 1, transactionDate: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);