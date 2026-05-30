const r = require('express').Router();
const W = require('../models/Warehouse');
const auth = require('../middleware/auth');

r.get('/', auth, async (_q, res) => res.json(await W.find()));
r.post('/', auth, async (req, res) => {
  try { await W.create(req.body); res.json({ message: 'Warehouse added' }); }
  catch (e) { res.status(400).json({ message: e.code===11000?'Code exists':e.message }); }
});
module.exports = r;
