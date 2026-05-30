const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/forgotPassword'));
app.use('/api/products', require('./routes/products'));
app.use('/api/warehouses', require('./routes/warehouses'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reports', require('./routes/reports'));
app.get('/', (_q, res) => res.send('SMS API (MongoDB) running'));

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log('Server on '+PORT)))
  .catch(e => { console.error(e); process.exit(1); });
