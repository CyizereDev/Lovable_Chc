const r = require('express').Router();
const T = require('../models/StockTransaction');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');

function range(period) {
  const now = new Date();
  const start = new Date(now); const end = new Date(now);
  if (period === 'daily') { start.setHours(0,0,0,0); end.setHours(23,59,59,999); }
  else if (period === 'weekly') {
    const day = (now.getDay()+6)%7; // Monday start
    start.setDate(now.getDate()-day); start.setHours(0,0,0,0);
    end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
  } else if (period === 'monthly') {
    start.setDate(1); start.setHours(0,0,0,0);
    end.setMonth(start.getMonth()+1, 0); end.setHours(23,59,59,999);
  } else return null;
  return { start, end };
}

async function enrich(list) {
  const ps = await Product.find({ productCode: { $in: list.map(t=>t.productCode) } });
  const ws = await Warehouse.find({ warehouseCode: { $in: list.map(t=>t.warehouseCode) } });
  const pm = Object.fromEntries(ps.map(p=>[p.productCode,p.productName]));
  const wm = Object.fromEntries(ws.map(w=>[w.warehouseCode,w.warehouseName]));
  return list.map(t => ({
    transactionDate: t.transactionDate?.toISOString().slice(0,10),
    productName: pm[t.productCode] || t.productCode,
    warehouseName: wm[t.warehouseCode] || t.warehouseCode,
    quantityMoved: t.quantityMoved,
  }));
}

r.get('/:period', auth, async (req, res) => {
  const rng = range(req.params.period);
  if (!rng) return res.status(400).json({ message: 'Invalid period' });
  const base = { transactionDate: { $gte: rng.start, $lte: rng.end } };
  const [inList, outList, products] = await Promise.all([
    T.find({ ...base, transactionType: 'IN' }).lean(),
    T.find({ ...base, transactionType: 'OUT' }).lean(),
    Product.find().lean(),
  ]);
  res.json({
    stockIn: await enrich(inList),
    stockOut: await enrich(outList),
    available: products.map(p => ({
      productCode: p.productCode, productName: p.productName,
      quantityInStock: p.quantityInStock, unitPrice: p.unitPrice,
    })),
  });
});

module.exports = r;
