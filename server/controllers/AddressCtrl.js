import mongoose from 'mongoose';
import Address from '../models/addressModel.js'; // Import the Address model

// Add a new address
export const addAddress = async (req, res) => {
    try {
        const { name, mobileNo, address, pincode, city, state, country, landmark } = req.body;
        const userId = req.user._id;

        if (!name || !mobileNo || !address || !pincode || !state || !country) {
            return res.status(400).json({ message: 'Please provide all required fields: name, mobileNo, address, pincode, state, and country.' });
        }

        const newAddress = new Address({
            userId,
            name,
            mobileNo,
            address,
            pincode,
            city,
            state,
            country,
            landmark
        });

        const savedAddress = await newAddress.save();
        return res.status(201).json({ message: 'Address added successfully', address: savedAddress });
    } catch (error) {
        console.error('Error adding address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Update an existing address
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const addressId = req.params.id;
        const { name, mobileNo, address, pincode, city, state, country, landmark } = req.body;

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ message: 'Invalid addressId' });
        }

        let addressToUpdate = await Address.findOne({ _id: addressId, userId });
        if (!addressToUpdate) {
            return res.status(404).json({ message: 'Address not found' });
        }

        Object.assign(addressToUpdate, { name, mobileNo, address, pincode, city, state, country, landmark });
        const updatedAddress = await addressToUpdate.save();
        return res.status(200).json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all addresses for the authenticated user
export const getAddresses = async (req, res) => {
    try {
        const userId = req.user._id;
        const addresses = await Address.find({ userId });
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete an address
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const addressId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
            return res.status(400).json({ message: 'Invalid addressId' });
        }

        const addressToDelete = await Address.findOne({ _id: addressId, userId });
        if (!addressToDelete) {
            return res.status(404).json({ message: 'Address not found' });
        }

        await addressToDelete.deleteOne();
        return res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
