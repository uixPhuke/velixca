import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getCart);      // GET user's cart
router.post('/add', verifyToken, addToCart); // Add item to cart
router.post('/remove', verifyToken, removeFromCart); // Remove item
router.delete('/clear', verifyToken, clearCart); // Clear entire cart

export default router;
