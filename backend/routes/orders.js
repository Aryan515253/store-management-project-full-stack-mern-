const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

// POST /api/orders - Employee creates a new bill/order
router.post('/', requireAuth, requireRole('employee'), async (req, res) => {
  const { customerEmail, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  if (!customerEmail || !customerEmail.trim()) {
    return res.status(400).json({ error: 'Customer email is required' });
  }

  // 1. Verify customer exists in database
  const customer = await User.findOne({ 
    email: customerEmail.trim().toLowerCase(), 
    role: 'customer' 
  });

  if (!customer) {
    return res.status(400).json({ error: 'Customer not found. Please register the customer first.' });
  }

  const decremented = [];
  const orderItems = [];
  let total = 0;

  try {
    // 2. Process stock updates
    for (const { productId, qty } of items) {
      if (!productId || !qty || qty < 1) {
        throw new Error('Each item needs a valid productId and qty >= 1');
      }

      const updated = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!updated) {
        const existing = await Product.findById(productId);
        const label = existing ? existing.name : productId;
        throw new Error(`Not enough stock for "${label}"`);
      }

      decremented.push({ productId, qty });
      orderItems.push({
        product: updated._id,
        name: updated.name,
        qty,
        priceAtSale: updated.price
      });
      total += updated.price * qty;
    }

    // 3. Create order record
    const order = await Order.create({
      customer: customer._id,
      employee: req.user.id,
      items: orderItems,
      total
    });

    res.status(201).json(order);
  } catch (err) {
    // Rollback stock updates if order creation fails
    for (const { productId, qty } of decremented) {
      await Product.findByIdAndUpdate(productId, { $inc: { stock: qty } });
    }
    res.status(400).json({ error: err.message });
  }
});

// GET /api/orders - Employee/Manager views past orders
router.get('/', requireAuth, requireRole('employee'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;