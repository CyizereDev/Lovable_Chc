const r = require('express').Router();
const T = require('../models/StockTransaction');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');

// enrich with names
async function enrich(list) {
  const codes = [...new Set(list.map(t=>t.productCode))];
  const wcodes = [...new Set(list.map(t=>t.warehouseCode))];
  const [ps, ws] = await Promise.all([
    Product.find({ productCode: { $in: codes } }),
    Warehouse.find({ warehouseCode: { $in: wcodes } }),
  ]);
  const pm = Object.fromEntries(ps.map(p=>[p.productCode,p.productName]));
  const wm = Object.fromEntries(ws.map(w=>[w.warehouseCode,w.warehouseName]));
  return list.map(t => ({
    transactionId: t._id, productCode: t.productCode, warehouseCode: t.warehouseCode,
    productName: pm[t.productCode] || t.productCode,
    warehouseName: wm[t.warehouseCode] || t.warehouseCode,
    transactionDate: t.transactionDate, quantityMoved: t.quantityMoved, transactionType: t.transactionType,
  }));
}

r.get('/', auth, async (_q, res) => {
  const list = await T.find().sort({ transactionDate: -1, createdAt: -1 }).lean();
  res.json(await enrich(list));
});

r.post('/', auth, async (req, res) => {
  try {
    const { productCode, warehouseCode, transactionDate, quantityMoved, transactionType } = req.body;
    await T.create({ productCode, warehouseCode, transactionDate, quantityMoved, transactionType });
    const delta = transactionType === 'IN' ? Number(quantityMoved) : -Number(quantityMoved);
    await Product.updateOne({ productCode }, { $inc: { quantityInStock: delta } });
    res.json({ message: 'Transaction recorded' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.put('/:id', auth, async (req, res) => {
  try {
    const { transactionDate, quantityMoved, transactionType } = req.body;
    await T.findByIdAndUpdate(req.params.id, { transactionDate, quantityMoved, transactionType });
    res.json({ message: 'Updated' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

r.delete('/:id', auth, async (req, res) => {
  try { await T.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = r;
