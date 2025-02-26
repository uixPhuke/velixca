import express from 'express';
import {
  createProductAdmin,
  editProductAdmin,
  getProductsAdmin,
  deleteProductAdmin,
  getProductAdmin,
  getProduct,
  getAllProducts,
} from '../controllers/productController.js';
import { upload } from '../utils/multerConfig.js'; // Assuming you're using Multer for file uploads
import { authenticateAdmin } from '../middleware/authMiddleware.js'; // Middleware for admin authentication

const router = express.Router();

// Create Product (Admin Only)
router.post(
  '/admin/create',
  authenticateAdmin,
  upload.array('images', 5), // Allow up to 5 images
  createProductAdmin
);

// Edit Product (Admin Only)
router.put(
  '/admin/edit/:productID',
  authenticateAdmin,
  upload.array('images', 5), // Allow up to 5 images
  editProductAdmin
);

// Fetch All Products (Admin Only)
router.get('/admin/all', authenticateAdmin, getProductsAdmin);

// Fetch Single Product (Admin Only)
router.get('/admin/:productID', authenticateAdmin, getProductAdmin);

// Delete Product (Admin Only)
router.delete('/admin/delete/:productID', authenticateAdmin, deleteProductAdmin);

// Fetch Single Product (Public Route)
router.get('/:productID', getProduct);

// Fetch All Products (Public Route with Filters)
router.get('/', getAllProducts);

export default router;