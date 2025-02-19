import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: [0, 'Discount must be at least 0'],
        max: [100, 'Discount cannot exceed 100'],
    },
    minPurchaseAmount: {
        type: Number,
        default: 0,
        min: [0, 'Minimum purchase amount cannot be negative'],
    },
  
    
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserVelixa', // Reference to users who used the discount
    }],
    expiresAt: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v > new Date();
            },
            message: 'Expiration date must be in the future!',
        },
        index: true,
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'used'],
        default: 'active',
    },
}, { timestamps: true });

// Auto-update status based on expiration date
discountSchema.pre('save', function (next) {
    if (this.expiresAt && this.expiresAt < new Date()) {
        this.status = 'expired';
    }
    next();
});

discountSchema.index({ code: 1, expiresAt: 1 });

const Discount = mongoose.models.DiscountVelixa || mongoose.model('DiscountVelixa', discountSchema);

export default Discount;
