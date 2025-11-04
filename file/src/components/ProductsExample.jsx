import React, { useState, useEffect } from 'react';
import { productService } from '../api/services';
import { toast } from 'react-toastify';

/**
 * Example component showing how to use the API services
 * This demonstrates fetching, creating, updating, and deleting products
 */
const ProductsExample = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch all products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
            toast.success('Products loaded successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Create new product
    const createProduct = async (productData) => {
        try {
            const newProduct = await productService.createProduct(productData);
            setProducts([...products, newProduct]);
            toast.success('Product created successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
        }
    };

    // Update product
    const updateProduct = async (id, productData) => {
        try {
            const updatedProduct = await productService.updateProduct(id, productData);
            setProducts(products.map(p => p._id === id ? updatedProduct : p));
            toast.success('Product updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update product');
        }
    };

    // Delete product
    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await productService.deleteProduct(id);
            setProducts(products.filter(p => p._id !== id));
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete product');
        }
    };

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Products</h5>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    // Open create product modal/form
                                    const sampleProduct = {
                                        name: 'New Product',
                                        price: 99.99,
                                        description: 'Product description',
                                        category: 'Electronics'
                                    };
                                    createProduct(sampleProduct);
                                }}
                            >
                                Add Product
                            </button>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Price</th>
                                                <th>Category</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product._id}>
                                                    <td>{product.name}</td>
                                                    <td>${product.price}</td>
                                                    <td>{product.category}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-info me-2"
                                                            onClick={() => setSelectedProduct(product)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-warning me-2"
                                                            onClick={() => {
                                                                const updatedData = { ...product, price: product.price + 10 };
                                                                updateProduct(product._id, updatedData);
                                                            }}
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => deleteProduct(product._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsExample;

/**
 * USAGE IN OTHER COMPONENTS:
 * 
 * 1. Import the service:
 *    import { productService, orderService, cartService } from '../api/services';
 * 
 * 2. Use in async functions:
 *    const products = await productService.getAllProducts();
 *    const order = await orderService.createOrder(orderData);
 *    await cartService.addToCart(productId, quantity);
 * 
 * 3. Handle errors:
 *    try {
 *      const data = await productService.getAllProducts();
 *    } catch (error) {
 *      toast.error(error.message);
 *    }
 * 
 * 4. With loading states:
 *    const [loading, setLoading] = useState(false);
 *    setLoading(true);
 *    try {
 *      const data = await productService.getAllProducts();
 *    } finally {
 *      setLoading(false);
 *    }
 */
