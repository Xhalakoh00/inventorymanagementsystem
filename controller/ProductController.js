const product = require('../Models/Product');

// 1. CREATE a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, size, description, price, quantity, color} = req.body;

        const product = new Product({
            name,
            size,
            description,
            price,
            quantity
        });

        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
};

// 2. READ all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: 'Products retrieved successfully', products });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
};

// 2b. READ a single product by its ID
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product retrieved successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error: error.message });
    }
};

// 3. UPDATE an existing product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, size, description, price, quantity, color } = req.body;

        // { new: true } ensures Mongoose returns the newly updated document instead of the old one
        const product = await Product.findByIdAndUpdate(
            id, 
            { name, size, description, price, quantity, color }, 
            { new: true } 
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
};

// 4. DELETE a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

