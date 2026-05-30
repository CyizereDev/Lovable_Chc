const r = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

r.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Missing fields' });
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash });
    res.json({ message: 'Registered successfully' });
  } catch (e) { res.status(400).json({ message: e.code===11000?'Username taken':e.message }); }
});

r.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const u = await User.findOne({ username });
    if (!u) return res.status(400).json({ message: 'Invalid credentials' });
    if (!(await bcrypt.compare(password, u.password))) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: u._id, username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = r;
