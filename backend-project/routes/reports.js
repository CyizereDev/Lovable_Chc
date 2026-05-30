const r = require('express').Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');

// GET reports by period
r.get('/:period', auth, async (req, res) => {
  try {
    const period = req.params.period;
    let dateFilter = {};
    const now = new Date();
    
    // Set date filter based on period
    if (period === 'daily') {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter = {
        transactionDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      };
    } else if (period === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      dateFilter = { transactionDate: { $gte: weekAgo } };
    } else if (period === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter = { transactionDate: { $gte: monthAgo } };
    }
    
    console.log(`Fetching reports for period: ${period}`);
    console.log('Date filter:', dateFilter);
    
    // Get all products for available stock
    const available = await Product.find({}, 'productCode productName quantityInStock unitPrice')
      .sort({ productName: 1 });
    
    // Get stock in transactions with proper population
    const stockIn = await Transaction.find({ 
      ...dateFilter, 
      transactionType: 'IN' 
    }).sort({ transactionDate: -1 });
    
    // Get stock out transactions with proper population
    const stockOut = await Transaction.find({ 
      ...dateFilter, 
      transactionType: 'OUT' 
    }).sort({ transactionDate: -1 });
    
    // Manually populate product and warehouse names
    const formatTransactions = async (transactions) => {
      const formatted = [];
      for (const t of transactions) {
        const product = await Product.findOne({ productCode: t.productCode });
        const warehouse = await Warehouse.findOne({ warehouseCode: t.warehouseCode });
        
        formatted.push({
          transactionDate: t.transactionDate,
          productName: product ? product.productName : 'Unknown',
          warehouseName: warehouse ? warehouse.warehouseName : 'Unknown',
          quantityMoved: t.quantityMoved
        });
      }
      return formatted;
    };
    
    const formattedStockIn = await formatTransactions(stockIn);
    const formattedStockOut = await formatTransactions(stockOut);
    
    res.json({
      available: available.map(p => ({
        productCode: p.productCode,
        productName: p.productName,
        quantityInStock: p.quantityInStock,
        unitPrice: p.unitPrice
      })),
      stockIn: formattedStockIn,
      stockOut: formattedStockOut
    });
  } catch (error) {
    console.error('Error in reports:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = r;