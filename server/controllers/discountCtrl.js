import Discount from "../models/discountSchema.js";
import Cart from "../models/cartSchema.js";

/**
 * Add a new discount code
 */
export const addDiscountCode = async (req, res) => {
    try {
        const { code, discountPercentage, minPurchaseAmount, usageLimit, expiresAt } = req.body;

        if (!code || !discountPercentage) {
            return res.status(400).json({ message: "Code and discountPercentage are required" });
        }

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({ message: "Discount must be between 0 and 100" });
        }

        const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
        if (existingDiscount) {
            return res.status(400).json({ message: "This discount code already exists" });
        }

        const discount = new Discount({
            code: code.toUpperCase(),
            discountPercentage,
            minPurchaseAmount: minPurchaseAmount || 0,
            usageLimit: usageLimit || 1,
            expiresAt: expiresAt || null,
        });

        await discount.save();
        res.status(201).json({ message: "Discount code added successfully", discount });
    } catch (error) {
        console.error("Error adding discount code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Apply a discount code
 */
export const applyDiscountCode = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user._id;

        if (!code) {
            return res.status(400).json({ message: "Discount code is required" });
        }

        const discount = await Discount.findOne({ code: code.toUpperCase() });
        if (!discount) {
            return res.status(404).json({ message: "Invalid discount code" });
        }

        if (discount.expiresAt && new Date() > discount.expiresAt) {
            return res.status(400).json({ message: "This discount code has expired" });
        }

        if (discount.usedBy.includes(userId)) {
            return res.status(400).json({ message: "You have already used this discount code" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty. Add items before applying a discount." });
        }

        if (cart.totalCartPrice < discount.minPurchaseAmount) {
            return res.status(400).json({ message: `Minimum purchase amount must be QAR ${discount.minPurchaseAmount}` });
        }

        const discountAmount = (cart.totalCartPrice * discount.discountPercentage) / 100;
        const discountedPrice = cart.totalCartPrice - discountAmount;

        cart.discountApplied = {
            code: discount.code,
            discountPercentage: discount.discountPercentage,
            discountAmount,
        };

        discount.usedBy.push(userId);
        await Promise.all([cart.save(), discount.save()]);

        res.status(200).json({
            message: "Discount applied successfully",
            cart: {
                ...cart.toObject(),
                totalCartPrice: discountedPrice,
            },
        });
    } catch (error) {
        console.error("Error applying discount code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Remove applied discount code
 */
export const removeDiscountCode = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ userId });

        if (!cart || !cart.discountApplied) {
            return res.status(400).json({ message: "No discount code applied to your cart." });
        }

        const discount = await Discount.findOne({ code: cart.discountApplied.code });

        if (discount) {
            discount.usedBy = discount.usedBy.filter(id => id.toString() !== userId.toString());
            await discount.save();
        }

        cart.discountApplied = null;
        await cart.save();

        res.status(200).json({
            message: "Discount code removed successfully",
            cart,
        });
    } catch (error) {
        console.error("Error removing discount code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Check applied discount
 */
export const checkDiscount = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversionRate = req.conversionRate || 1;
        const currency = req.currency || "QAR";

        const cart = await Cart.findOne({ userId });

        if (cart && cart.discountApplied) {
            const discountDetails = cart.discountApplied;

            const convertedDiscountDetails = {
                ...discountDetails,
                discountAmount: (discountDetails.discountAmount * conversionRate).toFixed(2),
                totalAfterDiscount: (cart.totalCartPrice * conversionRate).toFixed(2),
            };

            return res.status(200).json({
                discountApplied: convertedDiscountDetails,
                currency,
            });
        }

        return res.status(200).json({ discountApplied: null, currency });
    } catch (error) {
        console.error("Error checking discount:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
