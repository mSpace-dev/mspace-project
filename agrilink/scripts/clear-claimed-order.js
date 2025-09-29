#!/usr/bin/env node
/**
 * Usage:
 *   In PowerShell:
 *     $env:MONGODB_URI = 'your-mongo-uri'; node .\scripts\clear-claimed-order.js <ORDER_ID>
 *
 * This script will unset supplier.claimedAt for the specified order.
 */
const mongoose = require('mongoose');

async function main() {
  const orderId = process.argv[2];
  const uri = process.env.MONGODB_URI;
  if (!orderId) {
    console.error('Error: order id required as first argument');
    process.exit(1);
  }
  if (!uri) {
    console.error('Error: MONGODB_URI environment variable is required');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const Order = require('../src/lib/models/Order').default;

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      process.exit(2);
    }

    if (!order.supplier || !order.supplier.claimedAt) {
      console.log('Order does not have supplier.claimedAt set. Nothing to do.');
      process.exit(0);
    }

    // Unset claimedAt only
    order.supplier.claimedAt = undefined;
    await order.save();
    console.log('Cleared supplier.claimedAt for order', orderId);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
