import Cart from '../models/cartSchema.js';
import Product from '../models/ProductVelixa.js';

//  Get User's Cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart) return res.status(200).json({ items: [] });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
};

// Add Item to Cart
export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [{ productId, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding item', error });
    }
};

// Remove Item from Cart
export const removeFromCart = async (req, res) => {
    const { productId } = req.body;

    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item', error });
    }
};

// Clear Cart
export const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing done cart', error });
    }
};
