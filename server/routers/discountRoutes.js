const express = require("express");
const { 
    addDiscountCode, 
    applyDiscountCode, 
    removeDiscountCode, 
    checkDiscount 
} = require("../controllers/discountCtrl.js");
const { verifyToken } = require("../middleware/auth.js");
const { verifyAdmin } = require("../middleware/adminAuth.js"); // Import admin middleware

const router = express.Router();

// Admin route - Only admins can add discount codes
router.post("/add", verifyToken, verifyAdmin, addDiscountCode);

// Apply discount code (Only authenticated users)
router.post("/apply", verifyToken, applyDiscountCode);

// Remove applied discount code (Only authenticated users)
router.delete("/remove", verifyToken, removeDiscountCode);

// Check applied discount (Only authenticated users)
router.get("/check", verifyToken, checkDiscount);

module.exports = router; // ✅ Use `module.exports`
