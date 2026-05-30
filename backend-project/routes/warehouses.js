const r = require('express').Router();
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');

// GET all warehouses
r.get('/', auth, async (_q, res) => {
  try {
    const warehouses = await Warehouse.find().sort({ warehouseCode: 1 });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single warehouse
r.get('/:code', auth, async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({ warehouseCode: req.params.code });
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create warehouse
r.post('/', auth, async (req, res) => {
  try {
    const existing = await Warehouse.findOne({ warehouseCode: req.body.warehouseCode });
    if (existing) {
      return res.status(400).json({ message: 'Warehouse code already exists' });
    }
    await Warehouse.create(req.body);
    res.json({ message: 'Warehouse added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update warehouse
r.put('/:code', auth, async (req, res) => {
  try {
    const warehouse = await Warehouse.findOneAndUpdate(
      { warehouseCode: req.params.code },
      req.body,
      { new: true, runValidators: true }
    );
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.json({ message: 'Warehouse updated successfully', warehouse });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE warehouse
r.delete('/:code', auth, async (req, res) => {
  try {
    const warehouse = await Warehouse.findOneAndDelete({ warehouseCode: req.params.code });
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = r;