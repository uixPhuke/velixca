import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the schema for clothing products
const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        index: true, // Indexed for faster searches
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000, // Limit to 2000 characters for performance
    },
    images: [{ type: String, required: true }], // Array of image URLs
    totalPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        enum: ['tshirts', 'shirts', 'jeans', 'jackets', 'hoodies', 'dresses', 'skirts', 'shorts', 'pants', 'ethnic', 'formal', 'casual', 'activewear'],
        required: true,
        index: true,
    },
    sizes: {
        type: [String],
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        default: [],
    },
    fabricType: {
        type: String,
        required: true,
        index: true,
    },
    fitType: {
        type: String,
        enum: ['Slim Fit', 'Regular Fit', 'Loose Fit', 'Oversized'],
        required: true,
        index: true, 
    },
    pattern: {
        type: String,
        enum: ['Solid', 'Striped', 'Checked', 'Floral', 'Printed', 'Graphic', 'Abstract'],
        required: true,
    },
    sleeveType: {
        type: String,
        enum: ['Full Sleeve', 'Half Sleeve', 'Sleeveless', 'Cap Sleeve', 'Three-Quarter Sleeve'],
        required: false,
    },
    collarType: {
        type: String,
        enum: ['Round Neck', 'V Neck', 'Polo', 'Turtleneck', 'Collared', 'Mandarin Collar'],
        required: false,
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex', 'Kids'],
        required: true,
        index: true,
    },
    color: {
        type: String,
        required: true,
        index: true,
    },
    stock: { type: Number, required: true },
    availableState: { type: Boolean, default: true, required: true },
    madeToOrder: { type: Boolean, default: false, required: true },
    popular: { type: Boolean, default: false, required: true },
    country: { type: String, required: true },
    active: {
        type: String,
        enum: ['freeze', 'active'],
        default: 'active',
        required: true,
    },
    productCode: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
    },
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVelixa', // References another product
        default: [],
    }],
}, { timestamps: true });

// Indexes for better performance
productSchema.index({ createdAt: -1 }); // Sorting by creation date
productSchema.index({ color: 1 });
productSchema.index({ productCode: 1 });
productSchema.index({ fabricType: 1 });

// Compile the model
const Product = mongoose.models.ProductVelixa || mongoose.model('ProductVelixa', productSchema);

export default Product;
