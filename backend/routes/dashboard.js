const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/sales', requireAuth, requireRole('employee'), async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysOrders = await Order.find({ createdAt: { $gte: startOfDay } });

    const totalSales = todaysOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = todaysOrders.length;

    const lowStock = await Product.find({ stock: { $lte: 5 } }).select('name stock');

    res.json({
      date: startOfDay.toISOString().slice(0, 10),
      totalSales,
      orderCount,
      lowStock
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;