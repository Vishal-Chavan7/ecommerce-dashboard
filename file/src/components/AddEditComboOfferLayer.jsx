import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddEditComboOfferLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        items: [
            { productId: '', quantity: 1 },
            { productId: '', quantity: 1 }
        ],
        comboPrice: '',
        status: 'active',
        startDate: '',
        endDate: ''
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingOffer, setFetchingOffer] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        if (isEditMode) {
            fetchComboOffer();
        }
    }, [id]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            const productsData = Array.isArray(response.data) ? response.data : response.data.data || [];
            setProducts(productsData);
            console.log('Products loaded:', productsData.length);

            if (productsData.length === 0) {
                toast.warning('No products found in database');
            } else {
                toast.success(`${productsData.length} products loaded`);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        }
    };

    const fetchComboOffer = async () => {
        try {
            setFetchingOffer(true);
            const response = await api.get(`/admin/combo-offers/${id}`);
            const offer = response.data.data;

            // Convert items: if productId is populated object, get its _id
            const items = offer.items.map(item => ({
                productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
                quantity: item.quantity
            }));

            setFormData({
                title: offer.title || '',
                items: items.length >= 2 ? items : [
                    { productId: '', quantity: 1 },
                    { productId: '', quantity: 1 }
                ],
                comboPrice: offer.comboPrice || '',
                status: offer.status || 'active',
                startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
                endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : ''
            });
        } catch (error) {
            console.error('Error fetching combo offer:', error);
            toast.error('Failed to fetch combo offer details');
            navigate('/combo-offers-list');
        } finally {
            setFetchingOffer(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData(prev => ({
            ...prev,
            items: newItems
        }));
        // Clear item errors
        if (errors[`item_${index}_${field}`]) {
            setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length <= 2) {
            toast.warning('Minimum 2 products required in combo');
            return;
        }
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            items: newItems
        }));
    };

    const getProductPrice = (productId) => {
        const product = products.find(p => p._id === productId);
        return product?.price || 0;
    };

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? (product.title || product.name) : '';
    };

    const calculateTotalPrice = () => {
        return formData.items.reduce((total, item) => {
            if (item.productId && item.quantity > 0) {
                return total + (getProductPrice(item.productId) * item.quantity);
            }
            return total;
        }, 0);
    };

    const calculateSavings = () => {
        const totalPrice = calculateTotalPrice();
        const comboPrice = parseFloat(formData.comboPrice) || 0;
        const savings = totalPrice - comboPrice;
        const savingsPercent = totalPrice > 0 ? ((savings / totalPrice) * 100).toFixed(1) : 0;
        return { savings, savingsPercent, totalPrice };
    };

    const validateForm = () => {
        const newErrors = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        // Items validation
        if (formData.items.length < 2) {
            newErrors.items = 'Minimum 2 products required';
        }

        formData.items.forEach((item, index) => {
            if (!item.productId) {
                newErrors[`item_${index}_productId`] = 'Please select a product';
            }
            if (!item.quantity || item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
        });

        // Check for duplicate products
        const productIds = formData.items.map(item => item.productId).filter(Boolean);
        const uniqueProductIds = new Set(productIds);
        if (productIds.length !== uniqueProductIds.size) {
            newErrors.items = 'Duplicate products are not allowed';
        }

        // Combo price validation
        if (!formData.comboPrice || parseFloat(formData.comboPrice) <= 0) {
            newErrors.comboPrice = 'Combo price must be greater than 0';
        }

        const totalPrice = calculateTotalPrice();
        if (parseFloat(formData.comboPrice) >= totalPrice) {
            newErrors.comboPrice = 'Combo price should be less than total price for savings';
        }

        // Date validation
        if (formData.startDate && formData.endDate) {
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix all validation errors');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: formData.title.trim(),
                items: formData.items.map(item => ({
                    productId: item.productId,
                    quantity: parseInt(item.quantity)
                })),
                comboPrice: parseFloat(formData.comboPrice),
                status: formData.status,
                ...(formData.startDate && { startDate: new Date(formData.startDate).toISOString() }),
                ...(formData.endDate && { endDate: new Date(formData.endDate).toISOString() })
            };

            if (isEditMode) {
                await api.put(`/admin/combo-offers/${id}`, payload);
                toast.success('Combo offer updated successfully');
            } else {
                await api.post('/admin/combo-offers', payload);
                toast.success('Combo offer created successfully');
            }

            navigate('/combo-offers-list');
        } catch (error) {
            console.error('Error saving combo offer:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save combo offer';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const { savings, savingsPercent, totalPrice } = calculateSavings();

    if (fetchingOffer) {
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
            {products.length === 0 && (
                <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                    <Icon icon="mdi:alert" width="24" className="me-2" />
                    <div>
                        <strong>No products found in database!</strong> Please add products first.
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    {/* Main Form */}
                    <div className="col-lg-8">
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
                                        Combo Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Laptop + Mouse Combo"
                                    />
                                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Products in Combo */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:package-variant" className="me-2" />
                                    Products in Combo
                                    <span className="badge bg-primary ms-2">{formData.items.length}</span>
                                </h5>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={addItem}
                                >
                                    <Icon icon="mdi:plus" className="me-1" />
                                    Add Product
                                </button>
                            </div>
                            <div className="card-body">
                                {errors.items && (
                                    <div className="alert alert-danger d-flex align-items-center mb-3">
                                        <Icon icon="mdi:alert" className="me-2" />
                                        {errors.items}
                                    </div>
                                )}

                                {formData.items.map((item, index) => (
                                    <div key={index} className="card mb-3 border">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0">
                                                    <Icon icon="mdi:numeric-{index+1}-box" className="me-2" />
                                                    Product {index + 1}
                                                </h6>
                                                {formData.items.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Icon icon="mdi:delete" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="row">
                                                <div className="col-md-8">
                                                    <label className="form-label">
                                                        Select Product <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className={`form-select ${errors[`item_${index}_productId`] ? 'is-invalid' : ''}`}
                                                        value={item.productId}
                                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                    >
                                                        <option value="">Choose a product...</option>
                                                        {products.map(product => (
                                                            <option key={product._id} value={product._id}>
                                                                {product.title || product.name} - ₹{product.price}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors[`item_${index}_productId`] && (
                                                        <div className="invalid-feedback">{errors[`item_${index}_productId`]}</div>
                                                    )}
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">
                                                        Quantity <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className={`form-control ${errors[`item_${index}_quantity`] ? 'is-invalid' : ''}`}
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        min="1"
                                                    />
                                                    {errors[`item_${index}_quantity`] && (
                                                        <div className="invalid-feedback">{errors[`item_${index}_quantity`]}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {item.productId && (
                                                <div className="mt-3 p-2 bg-light rounded">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="text-muted small">
                                                            {item.quantity}x {getProductName(item.productId)}
                                                        </span>
                                                        <span className="fw-bold">
                                                            ₹{(getProductPrice(item.productId) * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="alert alert-info d-flex align-items-start">
                                    <Icon icon="mdi:information" width="20" className="me-2 mt-1" />
                                    <div className="small">
                                        <strong>Tip:</strong> Add at least 2 products to create a combo offer.
                                        Select products that complement each other for better customer appeal.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:cash" className="me-2" />
                                    Combo Pricing
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Total Original Price
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={totalPrice.toFixed(2)}
                                                disabled
                                            />
                                        </div>
                                        <small className="text-muted">
                                            Sum of all product prices × quantities
                                        </small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Combo Price <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.comboPrice ? 'is-invalid' : ''}`}
                                                name="comboPrice"
                                                value={formData.comboPrice}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.01"
                                                placeholder="Enter combo price"
                                            />
                                            {errors.comboPrice && (
                                                <div className="invalid-feedback">{errors.comboPrice}</div>
                                            )}
                                        </div>
                                        <small className="text-muted">
                                            Special bundled price for customers
                                        </small>
                                    </div>
                                </div>

                                {formData.comboPrice && totalPrice > 0 && (
                                    <div className="mt-3 p-3 bg-success-subtle rounded">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <Icon icon="mdi:tag" className="text-success me-2" />
                                                <span className="fw-bold text-success">Customer Savings</span>
                                            </div>
                                            <div className="text-end">
                                                <div className="fs-5 fw-bold text-success">
                                                    ₹{savings.toFixed(2)}
                                                </div>
                                                <div className="badge bg-success">
                                                    {savingsPercent}% OFF
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Validity Period */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:calendar-range" className="me-2" />
                                    Validity Period (Optional)
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                        />
                                        {errors.endDate && (
                                            <div className="invalid-feedback">{errors.endDate}</div>
                                        )}
                                    </div>
                                </div>
                                <small className="text-muted">
                                    Leave blank for always available combo offer
                                </small>
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
                                    <div className="col-md-6">
                                        <div
                                            className={`card cursor-pointer ${formData.status === 'active' ? 'border-success bg-success-subtle' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body text-center">
                                                <Icon
                                                    icon="mdi:check-circle"
                                                    width="32"
                                                    className={formData.status === 'active' ? 'text-success' : 'text-muted'}
                                                />
                                                <h6 className="mt-2 mb-0">Active</h6>
                                                <small className="text-muted">Combo is visible to customers</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div
                                            className={`card cursor-pointer ${formData.status === 'inactive' ? 'border-secondary bg-secondary-subtle' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body text-center">
                                                <Icon
                                                    icon="mdi:close-circle"
                                                    width="32"
                                                    className={formData.status === 'inactive' ? 'text-secondary' : 'text-muted'}
                                                />
                                                <h6 className="mt-2 mb-0">Inactive</h6>
                                                <small className="text-muted">Combo is hidden</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2 mb-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:content-save" className="me-2" />
                                        {isEditMode ? 'Update Combo Offer' : 'Create Combo Offer'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/combo-offers-list')}
                                disabled={loading}
                            >
                                <Icon icon="mdi:close" className="me-2" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Savings Preview */}
                        <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:chart-box" className="me-2" />
                                    Savings Preview
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Products:</span>
                                        <span className="fw-bold">{formData.items.length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Original Total:</span>
                                        <span className="fw-bold">₹{totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Combo Price:</span>
                                        <span className="fw-bold text-success">
                                            ₹{(parseFloat(formData.comboPrice) || 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold">Savings:</span>
                                        <span className="fw-bold text-success">
                                            ₹{savings.toFixed(2)} ({savingsPercent}%)
                                        </span>
                                    </div>
                                </div>

                                {savings <= 0 && formData.comboPrice && (
                                    <div className="alert alert-warning small mb-0">
                                        <Icon icon="mdi:alert" className="me-1" />
                                        Combo price should be less than total for customer savings
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:lightbulb" className="me-2 text-warning" />
                                    Quick Tips
                                </h6>
                            </div>
                            <div className="card-body">
                                <ul className="small mb-0 ps-3">
                                    <li className="mb-2">Bundle complementary products together</li>
                                    <li className="mb-2">Offer 15-25% savings for best conversion</li>
                                    <li className="mb-2">Use clear, descriptive titles</li>
                                    <li className="mb-2">Consider seasonal bundles</li>
                                    <li>Test different product combinations</li>
                                </ul>
                            </div>
                        </div>

                        {/* Example Combos */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:star" className="me-2 text-warning" />
                                    Example Combos
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="small">
                                    <div className="mb-3">
                                        <strong>Tech Bundle:</strong>
                                        <div className="text-muted">Laptop + Mouse + Keyboard</div>
                                    </div>
                                    <div className="mb-3">
                                        <strong>Beauty Pack:</strong>
                                        <div className="text-muted">2x Shampoo + Conditioner</div>
                                    </div>
                                    <div>
                                        <strong>Phone Essentials:</strong>
                                        <div className="text-muted">Phone + Case + Screen Guard</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddEditComboOfferLayer;
