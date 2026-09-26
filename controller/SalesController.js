const Sale = require('../Models/Sales');
const Product = require('../Models/Product');

// Process Checkout & Decrement Stock
exports.createSale = async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty.' });
    }

    // 1. Verify stock availability for all items before making any changes
    for (const item of items) {
      // If the product exists in MongoDB (valid ObjectId)
      if (item._id && item._id.length === 24) {
        const prod = await Product.findById(item._id);
        if (prod && prod.stock < item.qty) {
          return res.status(400).json({
            message: `Insufficient stock for "${prod.name}". Only ${prod.stock} units left.`,
          });
        }
      }
    }

    // 2. Decrement stock in MongoDB
    for (const item of items) {
      if (item._id && item._id.length === 24) {
        await Product.findByIdAndUpdate(item._id, {
          $inc: { stock: -item.qty },
        });
      }
    }

    // 3. Save the completed transaction
    const newSale = new Sale({
      cashierId: req.user?._id || null,
      cashierName: req.user?.name || 'Staff Cashier',
      items: items.map((i) => ({
        productId: i._id && i._id.length === 24 ? i._id : null,
        name: i.name,
        price: i.price,
        qty: i.qty,
        subtotal: i.price * i.qty,
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
    });

    await newSale.save();

    res.status(201).json({
      message: 'Sale completed successfully!',
      sale: newSale,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Failed to process sale.', error: err.message });
  }
};

// Retrieve Sales History (for reporting & auditing)
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.status(200).json({ sales });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving sales records.', error: err.message });
  }
};