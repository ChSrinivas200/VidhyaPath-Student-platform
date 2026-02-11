const MarketItem = require('../models/MarketItem');
const User = require('../models/User');

// @desc    Get all market items
// @route   GET /api/market
exports.getItems = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isSold: false }; // Only show unsold items

    if (category && category !== 'All') {
      query.category = category;
    }

    const items = await MarketItem.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    List a new item
// @route   POST /api/market
exports.createItem = async (req, res) => {
  try {
    const { title, description, price, originalPrice, category, condition, contactInfo } = req.body;
    
    // Get seller name from the logged-in user
    const user = await User.findById(req.user.id);

    const newItem = new MarketItem({
      sellerId: req.user.id,
      sellerName: user.name,
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      contactInfo
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mark item as sold / Delete item
// @route   DELETE /api/market/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await MarketItem.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check if user owns the item
    if (item.sellerId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};