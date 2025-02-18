import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true, // Ensure usernames are mandatory
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`,
        },
    },
    dob: {
        type: Date, // Mongoose already validates Date fields
    },
    password: {
        type: String,
        validate: {
            validator: function (v) {
                return this.isFirebaseAuth || (v && v.length >= 6);
            },
            message: 'Password must be at least 6 characters long unless using Firebase Auth',
        },
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isFirebaseAuth: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const User = mongoose.model('UserVelixa', userSchema);

export default User;
