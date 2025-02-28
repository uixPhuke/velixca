import express from 'express';
import {
  addAddress,
  updateAddress,
  getAddresses,
  deleteAddress,
} from '../controllers/addressController.js'; // Import the address controller functions
import { authenticateUser } from '../middleware/authMiddleware.js'; // Middleware for user authentication

const router = express.Router();

// Add a new address (Authenticated User)
router.post('/', authenticateUser, addAddress);

// Update an existing address (Authenticated User)
router.put('/:id', authenticateUser, updateAddress);

// Get all addresses for the authenticated user
router.get('/', authenticateUser, getAddresses);

// Delete an address (Authenticated User)
router.delete('/:id', authenticateUser, deleteAddress);

export default router;