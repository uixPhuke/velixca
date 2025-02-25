import Product from '../models/productModel.js';
import validator from "validator";
import xss from "xss";
import cloudinary from '../utils/cloudinary.js';

export const createProductAdmin = async (req, res, next) => {
  try {
    const { 
      title, description, totalPrice, sellingPrice, costPrice, category, sizes, fabricType, fitType, pattern, sleeveType, collarType, gender, color, stock, availableState, madeToOrder, popular, country, active, productCode, relatedProducts 
    } = req.body;

    const { images } = req.files;

    // Check for required fields
    if (!title) return res.status(400).json({ success: false, message: 'Title is required!' });
    if (!description) return res.status(400).json({ success: false, message: 'Description is required!' });
    if (!images || images.length === 0) return res.status(400).json({ success: false, message: 'At least one image is required!' });
    if (totalPrice === undefined) return res.status(400).json({ success: false, message: 'Total price is required!' });
    if (sellingPrice === undefined) return res.status(400).json({ success: false, message: 'Selling price is required!' });
    if (costPrice === undefined) return res.status(400).json({ success: false, message: 'Cost price is required!' });
    if (!category) return res.status(400).json({ success: false, message: 'Category is required!' });
    if (!fabricType) return res.status(400).json({ success: false, message: 'Fabric type is required!' });
    if (!fitType) return res.status(400).json({ success: false, message: 'Fit type is required!' });
    if (!pattern) return res.status(400).json({ success: false, message: 'Pattern is required!' });
    if (!gender) return res.status(400).json({ success: false, message: 'Gender is required!' });
    if (!color) return res.status(400).json({ success: false, message: 'Color is required!' });
    if (stock === undefined) return res.status(400).json({ success: false, message: 'Stock is required!' });
    if (!country) return res.status(400).json({ success: false, message: 'Country is required!' });
    if (!productCode) return res.status(400).json({ success: false, message: 'Product code is required!' });

    // Sanitize and escape inputs
    const sanitizedTitle = xss(validator.trim(validator.escape(title)));
    const sanitizedDescription = xss(validator.trim(validator.escape(description)));
    const sanitizedTotalPrice = validator.toFloat(totalPrice.toString());
    const sanitizedSellingPrice = validator.toFloat(sellingPrice.toString());
    const sanitizedCostPrice = validator.toFloat(costPrice.toString());
    const sanitizedCategory = xss(validator.trim(validator.escape(category)));
    const sanitizedSizes = sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : [];
    const sanitizedFabricType = xss(validator.trim(validator.escape(fabricType)));
    const sanitizedFitType = xss(validator.trim(validator.escape(fitType)));
    const sanitizedPattern = xss(validator.trim(validator.escape(pattern)));
    const sanitizedSleeveType = sleeveType ? xss(validator.trim(validator.escape(sleeveType))) : null;
    const sanitizedCollarType = collarType ? xss(validator.trim(validator.escape(collarType))) : null;
    const sanitizedGender = xss(validator.trim(validator.escape(gender)));
    const sanitizedColor = xss(validator.trim(validator.escape(color)));
    const sanitizedStock = validator.toInt(stock.toString());
    const sanitizedAvailableState = availableState !== undefined ? validator.toBoolean(availableState.toString()) : true;
    const sanitizedMadeToOrder = madeToOrder !== undefined ? validator.toBoolean(madeToOrder.toString()) : false;
    const sanitizedPopular = popular !== undefined ? validator.toBoolean(popular.toString()) : false;
    const sanitizedCountry = xss(validator.trim(validator.escape(country)));
    const sanitizedActive = active ? xss(validator.trim(validator.escape(active))) : 'active';
    const sanitizedProductCode = xss(validator.trim(validator.escape(productCode)));

    // Upload images to Cloudinary
    const uploadImage = async (file) => {
      if (!file) return null;
      return cloudinary.uploader.upload(file.path, { folder: 'products' });
    };

    const uploadedImages = await Promise.all(images.map(file => uploadImage(file)));

    if (!uploadedImages || uploadedImages.length === 0) {
      return res.status(400).json({ success: false, message: 'Image upload failed or is empty!' });
    }

    // Create the product
    const product = new Product({
      title: sanitizedTitle,
      description: sanitizedDescription,
      images: uploadedImages.map(img => img.secure_url),
      totalPrice: sanitizedTotalPrice,
      sellingPrice: sanitizedSellingPrice,
      costPrice: sanitizedCostPrice,
      category: sanitizedCategory,
      sizes: sanitizedSizes,
      fabricType: sanitizedFabricType,
      fitType: sanitizedFitType,
      pattern: sanitizedPattern,
      sleeveType: sanitizedSleeveType,
      collarType: sanitizedCollarType,
      gender: sanitizedGender,
      color: sanitizedColor,
      stock: sanitizedStock,
      availableState: sanitizedAvailableState,
      madeToOrder: sanitizedMadeToOrder,
      popular: sanitizedPopular,
      country: sanitizedCountry,
      active: sanitizedActive,
      productCode: sanitizedProductCode,
      relatedProducts: relatedProducts || [],
    });

    // Save product to database
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product.toJSON(),
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(e => e.message).join(', '),
      });
    }
    return next(err);
  }
};

export const editProductAdmin = async (req, res, next) => {
  try {
    const { productID } = req.params;

    if (!productID) {
      return res.status(400).json({ success: false, message: 'Invalid Product ID!' });
    }

    const existingProduct = await Product.findById(productID);
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found!' });
    }

    const {
      title, description, totalPrice, sellingPrice, costPrice, category, sizes, fabricType, fitType, pattern, sleeveType, collarType, gender, color, stock, availableState, madeToOrder, popular, country, active, productCode, relatedProducts, deleteImages
    } = req.body;

    if (title !== undefined && !title) return res.status(400).json({ success: false, message: 'Title is required!' });
    if (description !== undefined && !description) return res.status(400).json({ success: false, message: 'Description is required!' });
    if (Object.prototype.hasOwnProperty.call(req.body, 'totalPrice') && totalPrice < 0) return res.status(400).json({ success: false, message: 'Total price must be a positive number!' });

    const sanitizedData = {
      ...(title !== undefined && { title: xss(validator.trim(validator.escape(title))) }),
      ...(description !== undefined && { description: xss(validator.trim(validator.escape(description))) }),
      ...(Object.prototype.hasOwnProperty.call(req.body, 'totalPrice') && { totalPrice: validator.toFloat(totalPrice.toString()) }),
      ...(sellingPrice !== undefined && { sellingPrice: validator.toFloat(sellingPrice.toString()) }),
      ...(costPrice !== undefined && { costPrice: validator.toFloat(costPrice.toString()) }),
      ...(category && { category: xss(validator.trim(validator.escape(category))) }),
      ...(sizes && { sizes: Array.isArray(sizes) ? sizes : JSON.parse(sizes) }),
      ...(fabricType && { fabricType: xss(validator.trim(validator.escape(fabricType))) }),
      ...(fitType && { fitType: xss(validator.trim(validator.escape(fitType))) }),
      ...(pattern && { pattern: xss(validator.trim(validator.escape(pattern))) }),
      ...(sleeveType && { sleeveType: xss(validator.trim(validator.escape(sleeveType))) }),
      ...(collarType && { collarType: xss(validator.trim(validator.escape(collarType))) }),
      ...(gender && { gender: xss(validator.trim(validator.escape(gender))) }),
      ...(color && { color: xss(validator.trim(validator.escape(color))) }),
      ...(stock !== undefined && { stock: validator.toInt(stock.toString()) }),
      ...(availableState !== undefined && { availableState: validator.toBoolean(availableState.toString()) }),
      ...(madeToOrder !== undefined && { madeToOrder: validator.toBoolean(madeToOrder.toString()) }),
      ...(popular !== undefined && { popular: validator.toBoolean(popular.toString()) }),
      ...(country && { country: xss(validator.trim(validator.escape(country))) }),
      ...(active && { active: xss(validator.trim(validator.escape(active))) }),
      ...(productCode && { productCode: xss(validator.trim(validator.escape(productCode))) }),
      ...(relatedProducts && { relatedProducts }),
    };

    const deleteOldImage = async (existingImgUrl) => {
      if (existingImgUrl) {
        const publicId = existingImgUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
    };

    // Delete images if requested
    if (deleteImages && Array.isArray(deleteImages)) {
      await Promise.all(deleteImages.map(async (imgUrl) => {
        await deleteOldImage(imgUrl);
      }));
      sanitizedData.images = existingProduct.images.filter(img => !deleteImages.includes(img));
    }

    if (req.files && req.files.images) {
      const uploadImage = async (file) => {
        return cloudinary.uploader.upload(file.path, { folder: 'products' });
      };

      const uploadedImages = await Promise.all(req.files.images.map(file => uploadImage(file)));
      sanitizedData.images = [...sanitizedData.images, ...uploadedImages.map(img => img.secure_url)];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productID,
      { $set: sanitizedData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(500).json({ success: false, message: 'Failed to update the product!' });
    }

    res.status(200).json({ success: true, message: 'Product updated successfully!', product: updatedProduct.toJSON() });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    return next(err);
  }
};

export const getProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Products not found',
      });
    }

    // Sort products by createdAt in descending order
    const sortedProducts = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply currency conversion
    const convertedProducts = sortedProducts.map(product => ({
      ...product.toObject(),
      totalPrice: (product.sellingPrice * req.conversionRate).toFixed(2),
      currency: req.currency,
    }));

    res.status(200).json({
      success: true,
      products: convertedProducts,
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteProductAdmin = async (req, res, next) => {
  try {
    const { productID } = req.params;

    if (!productID) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Product ID!'
      });
    }

    const product = await Product.findById(productID);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!'
      });
    }

    // Delete images from Cloudinary
    const deleteOldImage = async (existingImgUrl) => {
      if (existingImgUrl) {
        const publicId = existingImgUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }
    };

    await Promise.all(product.images.map(img => deleteOldImage(img)));

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product Deleted Successfully!',
      product
    });
  } catch (err) {
    return next(err);
  }
};

export const getProductAdmin = async (req, res, next) => {
  try {
    const { productID } = req.params;

    if (!productID) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Product ID!',
      });
    }

    const product = await Product.findById(productID);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!',
      });
    }

    // Apply currency conversion
    const convertedSellingPrice = (product.sellingPrice * req.conversionRate).toFixed(2);

    res.status(200).json({
      success: true,
      message: 'Product fetched Successfully!',
      product: {
        ...product.toObject(),
        totalPrice: convertedSellingPrice,
        currency: req.currency,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { productID } = req.params;

    if (!productID) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Product ID!',
      });
    }

    // Fetch the main product by ID
    const product = await Product.findById(productID);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found!',
      });
    }

    // Fetch related products
    const relatedProducts = await Product.find({
      _id: { $in: product.relatedProducts || [] },
    });

    const convertedSellingPrice = (product.sellingPrice * req.conversionRate).toFixed(2);

    res.status(200).json({
      success: true,
      message: 'Product fetched Successfully!',
      product: {
        ...product.toObject(),
        totalPrice: convertedSellingPrice,
        currency: req.currency,
        relatedProducts: relatedProducts.map(rp => ({
          _id: rp._id,
          title: rp.title,
          images: rp.images,
          sellingPrice: rp.sellingPrice,
          totalPrice: (rp.sellingPrice * req.conversionRate).toFixed(2),
          productCode: rp.productCode,
        })),
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, search = '', category, gender, price, sort = 'newest', productCode,
    } = req.query;

    const offset = (page - 1) * limit;

    // Filters
    const filters = {};
    const regexOptions = 'i'; // Case-insensitive regex search for text fields

    if (search) {
      filters.$or = [
        { title: new RegExp(search, regexOptions) },
        { category: new RegExp(search, regexOptions) },
      ];
    }
    if (productCode) {
      filters.productCode = productCode;
    }
    if (price) {
      const priceRanges = price.split(',');  // Split the multiple price ranges
      const priceFilters = priceRanges.map(range => {
        const [minPrice, maxPrice] = range.split('-').map(Number);
        if (isNaN(minPrice) || (maxPrice && isNaN(maxPrice))) {
          return null;  // If invalid range, return null
        }
        return maxPrice
          ? { totalPrice: { $gte: minPrice, $lte: maxPrice } }
          : { totalPrice: { $lte: minPrice } };
      }).filter(Boolean); // Remove any invalid ranges
    
      // Combine the multiple price filters with OR logic
      if (priceFilters.length > 0) {
        filters.$or = priceFilters;
      }
    }
    if (category) {
      filters.category = { $in: category.split(',') };
    }
    if (gender) {
      filters.gender = { $in: gender.split(',') };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default sort by newest
    if (sort === 'name') sortOptions = { title: 1 }; // Sort by name A-Z
    else if (sort === 'price') sortOptions = { sellingPrice: 1 }; // Sort by price from low to high
    else if (sort === 'oldest') sortOptions = { createdAt: 1 }; // Sort by oldest first

    // Query products and count total
    const productsQuery = Product.find(filters)
      .skip(offset)
      .limit(parseInt(limit, 10))
      .sort(sortOptions)
      .lean();

    const countQuery = Product.countDocuments(filters);

    const [products, count] = await Promise.all([productsQuery, countQuery]);

    // Format Products
    const formattedProducts = await Promise.all(products.map(async (product) => {
      const relatedProducts = await Product.find({
        _id: { $in: product.relatedProducts || [] },
      }).lean();

      const createdDate = new Date(product.createdAt);
      const formattedDate = createdDate.toISOString().split('T')[0].replace(/-/g, '');
      const uniqueId = `${product.title}${formattedDate}`;

      // Overwrite sellingPrice with the converted price
      const convertedSellingPrice = (product.sellingPrice * req.conversionRate).toFixed(2);

      return {
        ...product,
        uniqueId,
        totalPrice: convertedSellingPrice,
        currency: req.currency,
        relatedProducts: relatedProducts.map(rp => ({
          _id: rp._id,
          title: rp.title,
          images: rp.images,
          totalPrice: (rp.sellingPrice * req.conversionRate).toFixed(2),
          currency: req.currency,
        })),
      };
    }));

    // Response
    res.status(200).json({
      success: true,
      message: 'Products fetched successfully!',
      products: formattedProducts,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
};