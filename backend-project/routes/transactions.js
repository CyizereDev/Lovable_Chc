const r = require('express').Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');

// GET all transactions
r.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching transactions...');
    
    // Check if models are loaded
    if (!Transaction) {
      console.error('Transaction model not loaded');
      return res.status(500).json({ message: 'Transaction model not initialized' });
    }
    
    const transactions = await Transaction.find().sort({ transactionDate: -1 });
    console.log(`Found ${transactions.length} transactions`);
    
    // Manually populate the data
    const formatted = [];
    for (const t of transactions) {
      try {
        const product = await Product.findOne({ productCode: t.productCode });
        const warehouse = await Warehouse.findOne({ warehouseCode: t.warehouseCode });
        
        formatted.push({
          transactionId: t._id,
          transactionDate: t.transactionDate,
          productCode: t.productCode,
          productName: product ? product.productName : 'Unknown',
          warehouseCode: t.warehouseCode,
          warehouseName: warehouse ? warehouse.warehouseName : 'Unknown',
          quantityMoved: t.quantityMoved,
          transactionType: t.transactionType
        });
      } catch (err) {
        console.error(`Error formatting transaction ${t._id}:`, err.message);
        // Still include the transaction with unknown values
        formatted.push({
          transactionId: t._id,
          transactionDate: t.transactionDate,
          productCode: t.productCode,
          productName: 'Unknown',
          warehouseCode: t.warehouseCode,
          warehouseName: 'Unknown',
          quantityMoved: t.quantityMoved,
          transactionType: t.transactionType
        });
      }
    }
    
    res.json(formatted);
  } catch (error) {
    console.error('Error in GET /transactions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transactions',
      error: error.message 
    });
  }
});

// POST create transaction
r.post('/', auth, async (req, res) => {
  try {
    console.log('Creating transaction with data:', req.body);
    
    const { productCode, warehouseCode, transactionDate, quantityMoved, transactionType } = req.body;
    
    // Validate required fields
    if (!productCode || !warehouseCode || !quantityMoved || !transactionType) {
      return res.status(400).json({ 
        message: 'Missing required fields: productCode, warehouseCode, quantityMoved, transactionType are required' 
      });
    }
    
    // Validate product exists
    const product = await Product.findOne({ productCode });
    if (!product) {
      return res.status(404).json({ message: `Product with code ${productCode} not found` });
    }
    
    // Validate warehouse exists
    const warehouse = await Warehouse.findOne({ warehouseCode });
    if (!warehouse) {
      return res.status(404).json({ message: `Warehouse with code ${warehouseCode} not found` });
    }
    
    // Check if enough stock for OUT transaction
    if (transactionType === 'OUT' && product.quantityInStock < quantityMoved) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.quantityInStock}, Requested: ${quantityMoved}` 
      });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      productCode,
      warehouseCode,
      transactionDate: transactionDate || new Date(),
      quantityMoved: Number(quantityMoved),
      transactionType
    });
    
    // Update product stock
    if (transactionType === 'IN') {
      product.quantityInStock += Number(quantityMoved);
    } else {
      product.quantityInStock -= Number(quantityMoved);
    }
    await product.save();
    
    console.log('Transaction created successfully:', transaction._id);
    
    res.json({ 
      message: 'Transaction added successfully', 
      transaction: {
        transactionId: transaction._id,
        productCode,
        productName: product.productName,
        warehouseCode,
        warehouseName: warehouse.warehouseName,
        quantityMoved: Number(quantityMoved),
        transactionType,
        transactionDate: transaction.transactionDate
      }
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({ 
      message: error.message || 'Error saving transaction',
      details: error.errors 
    });
  }
});

// PUT update transaction
r.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating transaction:', req.params.id);
    
    const oldTransaction = await Transaction.findById(req.params.id);
    if (!oldTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Reverse old stock change
    const product = await Product.findOne({ productCode: oldTransaction.productCode });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (oldTransaction.transactionType === 'IN') {
      product.quantityInStock -= oldTransaction.quantityMoved;
    } else {
      product.quantityInStock += oldTransaction.quantityMoved;
    }
    
    // Check if enough stock for new OUT transaction
    if (req.body.transactionType === 'OUT' && product.quantityInStock < req.body.quantityMoved) {
      // Revert the reverse operation
      if (oldTransaction.transactionType === 'IN') {
        product.quantityInStock += oldTransaction.quantityMoved;
      } else {
        product.quantityInStock -= oldTransaction.quantityMoved;
      }
      await product.save();
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${product.quantityInStock}, Requested: ${req.body.quantityMoved}` 
      });
    }
    
    // Apply new stock change
    if (req.body.transactionType === 'IN') {
      product.quantityInStock += req.body.quantityMoved;
    } else {
      product.quantityInStock -= req.body.quantityMoved;
    }
    await product.save();
    
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        productCode: req.body.productCode || oldTransaction.productCode,
        warehouseCode: req.body.warehouseCode || oldTransaction.warehouseCode,
        transactionDate: req.body.transactionDate || oldTransaction.transactionDate,
        quantityMoved: req.body.quantityMoved || oldTransaction.quantityMoved,
        transactionType: req.body.transactionType || oldTransaction.transactionType
      },
      { new: true, runValidators: true }
    );
    
    res.json({ message: 'Transaction updated successfully', transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE transaction
r.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting transaction:', req.params.id);
    
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Reverse stock change
    const product = await Product.findOne({ productCode: transaction.productCode });
    if (product) {
      if (transaction.transactionType === 'IN') {
        product.quantityInStock -= transaction.quantityMoved;
      } else {
        product.quantityInStock += transaction.quantityMoved;
      }
      await product.save();
    }
    
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = r;