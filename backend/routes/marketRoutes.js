const express = require('express');
const router = express.Router();
const { getItems, createItem, deleteItem } = require('../controllers/marketController');
const auth = require('../middleware/auth');

router.get('/', getItems);
router.post('/', auth, createItem);
router.delete('/:id', auth, deleteItem);

module.exports = router;