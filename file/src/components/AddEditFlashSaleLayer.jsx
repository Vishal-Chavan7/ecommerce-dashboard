import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddEditFlashSaleLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        products: [],
        startDate: '',
        endDate: '',
        status: 'scheduled'
    });

    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        fetchVariants();
        if (isEditMode) {
            fetchFlashSale();
        }
    }, [id]);

    const fetchFlashSale = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/flash-sales/${id}`);
            const sale = response.data.data;

            // Handle populated products - extract just the IDs
            const productsData = sale.products.map(item => ({
                productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
                variantId: item.variantId ? (typeof item.variantId === 'object' ? item.variantId._id : item.variantId) : '',
                flashPrice: item.flashPrice || '',
                stockLimit: item.stockLimit || ''
            }));

            setFormData({
                title: sale.title || '',
                products: productsData,
                startDate: sale.startDate ? new Date(sale.startDate).toISOString().split('T')[0] : '',
                endDate: sale.endDate ? new Date(sale.endDate).toISOString().split('T')[0] : '',
                status: sale.status || 'scheduled'
            });
        } catch (error) {
            console.error('Error fetching flash sale:', error);
            toast.error('Failed to fetch flash sale');
            navigate('/flash-sales-list');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            console.log('Products API response:', response.data);

            // Handle both response formats: direct array OR {success, data: array}
            let productsData = [];
            if (Array.isArray(response.data)) {
                // Direct array format
                productsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                // {success: true, data: [...]} format
                productsData = response.data.data;
            }

            console.log('Total products loaded:', productsData.length);
            console.log('Product titles:', productsData.map(p => p.title || p.name));

            setProducts(productsData);

            if (productsData.length === 0) {
                toast.warning('No products found. Please create products first.');
            } else {
                toast.success(`${productsData.length} products loaded successfully`);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            console.error('Error details:', error.response?.data);
            toast.error('Failed to fetch products. Check console for details.');
        }
    };

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants');
            console.log('Variants API response:', response.data);

            // Handle both response formats: direct array OR {success, data: array}
            let variantsData = [];
            if (Array.isArray(response.data)) {
                // Direct array format
                variantsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                // {success: true, data: [...]} format
                variantsData = response.data.data;
            }

            console.log('Total variants loaded:', variantsData.length);
            setVariants(variantsData);
        } catch (error) {
            console.error('Error fetching variants:', error);
            console.error('Error details:', error.response?.data);
            toast.error('Failed to fetch variants');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddProduct = () => {
        setFormData(prev => ({
            ...prev,
            products: [
                ...prev.products,
                {
                    productId: '',
                    variantId: '',
                    flashPrice: '',
                    stockLimit: ''
                }
            ]
        }));
    };

    const handleRemoveProduct = (index) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    const handleProductChange = (index, field, value) => {
        setFormData(prev => {
            const updatedProducts = [...prev.products];
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value
            };
            return {
                ...prev,
                products: updatedProducts
            };
        });
    };

    const getProductVariants = (productId) => {
        if (!productId) return [];
        return variants.filter(v => v.productId === productId);
    };

    const getProductPrice = (productId, variantId) => {
        if (variantId) {
            const variant = variants.find(v => v._id === variantId);
            return variant?.price || 0;
        }
        const product = products.find(p => p._id === productId);
        return product?.price || 0;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.products.length === 0) {
            newErrors.products = 'Add at least one product';
        } else {
            formData.products.forEach((item, index) => {
                if (!item.productId) {
                    newErrors[`product_${index}`] = 'Product is required';
                }
                if (!item.flashPrice || parseFloat(item.flashPrice) <= 0) {
                    newErrors[`flashPrice_${index}`] = 'Flash price must be greater than 0';
                }
                if (!item.stockLimit || parseInt(item.stockLimit) <= 0) {
                    newErrors[`stockLimit_${index}`] = 'Stock limit must be greater than 0';
                }
            });
        }

        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setLoading(true);

            const submitData = {
                title: formData.title.trim(),
                products: formData.products.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId || undefined,
                    flashPrice: parseFloat(item.flashPrice),
                    stockLimit: parseInt(item.stockLimit)
                })),
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/flash-sales/${id}`, submitData);
                toast.success('Flash sale updated successfully');
            } else {
                await api.post('/admin/flash-sales', submitData);
                toast.success('Flash sale created successfully');
            }

            navigate('/flash-sales-list');
        } catch (error) {
            console.error('Error saving flash sale:', error);
            toast.error(error.response?.data?.message || 'Failed to save flash sale');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">
                        <Icon icon={isEditMode ? "mdi:pencil" : "mdi:plus"} className="me-2" />
                        {isEditMode ? 'Edit Flash Sale' : 'Create Flash Sale'}
                    </h4>
                    <p className="text-muted mb-0">
                        {isEditMode ? 'Update flash sale information' : 'Set up time-bound offer with limited stock'}
                    </p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/flash-sales-list')}
                >
                    <Icon icon="mdi:arrow-left" className="me-1" />
                    Back to List
                </button>
            </div>

            <div className="row">
                {/* Form Section */}
                <div className="col-lg-8">
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:information" className="me-2" />
                                    Basic Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Mega Diwali Flash Sale"
                                    />
                                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:package-variant" className="me-2" />
                                    Products
                                    <small className="text-muted ms-2">({products.length} available)</small>
                                </h5>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={handleAddProduct}
                                >
                                    <Icon icon="mdi:plus" className="me-1" />
                                    Add Product
                                </button>
                            </div>
                            <div className="card-body">
                                {products.length === 0 && (
                                    <div className="alert alert-warning">
                                        <Icon icon="mdi:alert" className="me-2" />
                                        No products found in database. Please create products first before adding flash sales.
                                    </div>
                                )}
                                {errors.products && (
                                    <div className="alert alert-danger">{errors.products}</div>
                                )}

                                {formData.products.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <Icon icon="mdi:package-variant-closed" width="48" className="mb-2" />
                                        <p className="mb-0">No products added. Click "Add Product" to get started.</p>
                                    </div>
                                ) : (
                                    formData.products.map((item, index) => {
                                        const productVariants = getProductVariants(item.productId);
                                        const originalPrice = getProductPrice(item.productId, item.variantId);
                                        const discount = originalPrice && item.flashPrice
                                            ? (((originalPrice - item.flashPrice) / originalPrice) * 100).toFixed(0)
                                            : 0;

                                        return (
                                            <div key={index} className="card mb-3 border">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <h6 className="mb-0">Product #{index + 1}</h6>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleRemoveProduct(index)}
                                                        >
                                                            <Icon icon="mdi:delete" />
                                                        </button>
                                                    </div>

                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Product <span className="text-danger">*</span>
                                                            </label>
                                                            <select
                                                                className={`form-select ${errors[`product_${index}`] ? 'is-invalid' : ''}`}
                                                                value={item.productId}
                                                                onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                                                            >
                                                                <option value="">Select Product</option>
                                                                {products.map(product => (
                                                                    <option key={product._id} value={product._id}>
                                                                        {product.title || product.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {errors[`product_${index}`] && (
                                                                <div className="invalid-feedback">{errors[`product_${index}`]}</div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label">Variant (Optional)</label>
                                                            <select
                                                                className="form-select"
                                                                value={item.variantId}
                                                                onChange={(e) => handleProductChange(index, 'variantId', e.target.value)}
                                                                disabled={!item.productId}
                                                            >
                                                                <option value="">Default Variant</option>
                                                                {productVariants.map(variant => (
                                                                    <option key={variant._id} value={variant._id}>
                                                                        {variant.variantName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Flash Price (₹) <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className={`form-control ${errors[`flashPrice_${index}`] ? 'is-invalid' : ''}`}
                                                                value={item.flashPrice}
                                                                onChange={(e) => handleProductChange(index, 'flashPrice', e.target.value)}
                                                                placeholder="999"
                                                                step="0.01"
                                                            />
                                                            {errors[`flashPrice_${index}`] && (
                                                                <div className="invalid-feedback">{errors[`flashPrice_${index}`]}</div>
                                                            )}
                                                            {originalPrice > 0 && (
                                                                <small className="text-muted">
                                                                    Original: ₹{originalPrice}
                                                                    {discount > 0 && <span className="text-success ms-2">({discount}% OFF)</span>}
                                                                </small>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label className="form-label">
                                                                Stock Limit <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                className={`form-control ${errors[`stockLimit_${index}`] ? 'is-invalid' : ''}`}
                                                                value={item.stockLimit}
                                                                onChange={(e) => handleProductChange(index, 'stockLimit', e.target.value)}
                                                                placeholder="100"
                                                            />
                                                            {errors[`stockLimit_${index}`] && (
                                                                <div className="invalid-feedback">{errors[`stockLimit_${index}`]}</div>
                                                            )}
                                                            <small className="text-muted">Limited quantity available</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:calendar-range" className="me-2" />
                                    Duration
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Start Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                        {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            End Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                        />
                                        {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:toggle-switch" className="me-2" />
                                    Status
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div
                                            className={`card cursor-pointer ${formData.status === 'scheduled' ? 'border-primary' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: 'scheduled' }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body p-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="status"
                                                        value="scheduled"
                                                        checked={formData.status === 'scheduled'}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label w-100">
                                                        <div className="d-flex align-items-center">
                                                            <Icon icon="mdi:clock-outline" width="24" className="text-info me-2" />
                                                            <div>
                                                                <div className="fw-semibold">Scheduled</div>
                                                                <small className="text-muted">Wait for start date</small>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div
                                            className={`card cursor-pointer ${formData.status === 'running' ? 'border-primary' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: 'running' }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body p-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="status"
                                                        value="running"
                                                        checked={formData.status === 'running'}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label w-100">
                                                        <div className="d-flex align-items-center">
                                                            <Icon icon="mdi:lightning-bolt" width="24" className="text-success me-2" />
                                                            <div>
                                                                <div className="fw-semibold">Running</div>
                                                                <small className="text-muted">Active now</small>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div
                                            className={`card cursor-pointer ${formData.status === 'expired' ? 'border-primary' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: 'expired' }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body p-3">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="status"
                                                        value="expired"
                                                        checked={formData.status === 'expired'}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label w-100">
                                                        <div className="d-flex align-items-center">
                                                            <Icon icon="mdi:clock-alert-outline" width="24" className="text-danger me-2" />
                                                            <div>
                                                                <div className="fw-semibold">Expired</div>
                                                                <small className="text-muted">Ended</small>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="d-flex gap-2 mb-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:content-save" className="me-1" />
                                        {isEditMode ? 'Update Flash Sale' : 'Create Flash Sale'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/flash-sales-list')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Flash Sale Info */}
                    <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-warning text-dark">
                            <h6 className="mb-0">
                                <Icon icon="mdi:flash" className="me-2" />
                                Flash Sale Info
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <strong>Products:</strong>
                                <div className="text-muted">{formData.products.length} product(s) added</div>
                            </div>
                            <div className="mb-3">
                                <strong>Total Stock:</strong>
                                <div className="text-muted">
                                    {formData.products.reduce((sum, item) => sum + (parseInt(item.stockLimit) || 0), 0)} units
                                </div>
                            </div>
                            {formData.startDate && formData.endDate && (
                                <div className="mb-3">
                                    <strong>Duration:</strong>
                                    <div className="text-muted">
                                        {Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60))} hours
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">
                                <Icon icon="mdi:lightbulb" className="me-2" />
                                Quick Tips
                            </h6>
                        </div>
                        <div className="card-body">
                            <ul className="small mb-0 ps-3">
                                <li className="mb-2">Flash sales create urgency with limited time and stock</li>
                                <li className="mb-2">Set competitive flash prices (30-70% off)</li>
                                <li className="mb-2">Choose popular products with good margins</li>
                                <li className="mb-2">Schedule during peak shopping hours</li>
                                <li className="mb-2">Monitor stock levels in real-time</li>
                            </ul>
                        </div>
                    </div>

                    {/* Best Practices */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">
                                <Icon icon="mdi:star" className="me-2" />
                                Best Practices
                            </h6>
                        </div>
                        <div className="card-body">
                            <ul className="small mb-0 ps-3">
                                <li className="mb-2">
                                    <strong>Festival Sales:</strong> 50-70% off, 6-12 hours
                                </li>
                                <li className="mb-2">
                                    <strong>Weekend Deals:</strong> 30-40% off, 24-48 hours
                                </li>
                                <li className="mb-2">
                                    <strong>Hourly Flash:</strong> 60-80% off, 1-3 hours
                                </li>
                                <li className="mb-2">
                                    <strong>Clearance:</strong> 40-50% off, multiple days
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditFlashSaleLayer;
