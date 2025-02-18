import mongoose from "mongoose";

// Address schema
const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserVelixa', 
        required: true,
    },
    name: {
        type: String,
        required: true, 
    },
    mobileNo: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true, 
    },
    pincode: {
        type: String,
        required: true,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
        required: true, 
    },
    country: {
        type: String,
        required: true, 
    },
    landmark: {
        type: String, 
        default: ''
    }
}, { timestamps: true });

// Create Address model
const Address = mongoose.model('AddressVelixa', addressSchema);

export default Address;
