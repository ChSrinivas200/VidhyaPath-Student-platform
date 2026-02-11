const mongoose = require('mongoose');

const MarketItemSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  sellerName: { type: String, required: true },
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number }, // To show discount
  
  category: { 
    type: String, 
    required: true,
    enum: ['Textbooks', 'Electronics', 'Lab Coats', 'Stationery', 'Notes', 'Other'] 
  },
  
  condition: { 
    type: String, 
    required: true, 
    enum: ['New', 'Like New', 'Used', 'Rough'] 
  },
  
  contactInfo: { type: String, required: true }, // Phone number or Email
  isSold: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('marketItem', MarketItemSchema);