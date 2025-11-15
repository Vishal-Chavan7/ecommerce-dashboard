import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditProductPricingLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [productVariants, setProductVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        variantId: '',
        basePrice: '',
        discountType: 'flat',
        discountValue: '',
        currency: 'INR',
        status: true
    });
    const [errors, setErrors] = useState({});
    const [calculatedFinalPrice, setCalculatedFinalPrice] = useState(0);

    useEffect(() => {
        fetchProducts();
        fetchVariants();
        if (isEditMode) {
            fetchPricingData();
        }
    }, [id]);

    useEffect(() => {
        // Filter variants for selected product
        if (formData.productId) {
            const filtered = variants.filter(v => v.productId === formData.productId);
            setProductVariants(filtered);
        } else {
            setProductVariants([]);
        }
    }, [formData.productId, variants]);

    useEffect(() => {
        // Calculate final price whenever base price, discount type, or discount value changes
        calculateFinalPrice();
    }, [formData.basePrice, formData.discountType, formData.discountValue]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
    };

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants');
            setVariants(response.data || []);
        } catch (error) {
            console.error('Error fetching variants:', error);
        }
    };

    const fetchPricingData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/pricing/${id}`);
            const pricingData = response.data;

            setFormData({
                productId: pricingData.productId || '',
                variantId: pricingData.variantId || '',
                basePrice: pricingData.basePrice || '',
                discountType: pricingData.discountType || 'flat',
                discountValue: pricingData.discountValue || '',
                currency: pricingData.currency || 'INR',
                status: pricingData.status !== undefined ? pricingData.status : true
            });
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            toast.error('Failed to load pricing data');
            navigate('/product-pricing-list');
        } finally {
            setLoading(false);
        }
    };

    const calculateFinalPrice = () => {
        const base = parseFloat(formData.basePrice) || 0;
        const discount = parseFloat(formData.discountValue) || 0;
        let final = base;

        if (discount > 0) {
            if (formData.discountType === 'percent') {
                final = base - (base * discount / 100);
            } else {
                final = base - discount;
            }
        }

        setCalculatedFinalPrice(Math.max(0, final));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.productId.trim()) {
            newErrors.productId = 'Product is required';
        }

        if (!formData.basePrice || formData.basePrice <= 0) {
            newErrors.basePrice = 'Base price must be greater than 0';
        }

        if (formData.discountValue && formData.discountValue < 0) {
            newErrors.discountValue = 'Discount value cannot be negative';
        }

        if (formData.discountType === 'percent' && formData.discountValue > 100) {
            newErrors.discountValue = 'Percentage discount cannot exceed 100%';
        }

        if (formData.discountType === 'flat' && parseFloat(formData.discountValue) > parseFloat(formData.basePrice)) {
            newErrors.discountValue = 'Flat discount cannot exceed base price';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let updates = {
            [name]: type === 'checkbox' ? checked : value
        };

        // Reset variant when product changes
        if (name === 'productId') {
            updates.variantId = '';
        }

        setFormData(prev => ({
            ...prev,
            ...updates
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                productId: formData.productId,
                variantId: formData.variantId || null,
                basePrice: parseFloat(formData.basePrice),
                discountType: formData.discountType,
                discountValue: parseFloat(formData.discountValue) || 0,
                currency: formData.currency,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/pricing/${id}`, submitData);
                toast.success('Pricing updated successfully');
            } else {
                await api.post('/admin/pricing', submitData);
                toast.success('Pricing created successfully');
            }

            navigate('/product-pricing-list');
        } catch (error) {
            console.error('Error saving pricing:', error);
            const errorMessage = error.response?.data?.message ||
                `Failed to ${isEditMode ? 'update' : 'create'} pricing`;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.title : '';
    };

    if (isEditMode && loading && !formData.productId) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary-600" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-secondary-light">Loading pricing data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="row gy-4">
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">
                            {isEditMode ? 'Edit Product Pricing' : 'Add Product Pricing'}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Product Selection */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Product <span className="text-danger-600">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                                    name="productId"
                                    value={formData.productId}
                                    onChange={handleChange}
                                    disabled={loading}
                                    style={{ minWidth: '100%' }}
                                >
                                    <option value="">Select a product</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.productId && (
                                    <div className="invalid-feedback">{errors.productId}</div>
                                )}
                            </div>

                            {/* Variant Selection */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Variant (Optional)
                                </label>
                                <select
                                    className="form-select"
                                    name="variantId"
                                    value={formData.variantId}
                                    onChange={handleChange}
                                    disabled={loading || !formData.productId}
                                    style={{ minWidth: '100%' }}
                                >
                                    <option value="">No Variant (Product Level)</option>
                                    {productVariants.map(variant => (
                                        <option key={variant._id} value={variant._id}>
                                            {variant.sku} - {variant.color || ''} {variant.size || ''}
                                        </option>
                                    ))}
                                </select>
                                <div className="form-text">
                                    Leave empty for product-level pricing, or select a variant for SKU-level pricing
                                </div>
                            </div>

                            {/* Base Price */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Base Price <span className="text-danger-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.basePrice ? 'is-invalid' : ''}`}
                                    name="basePrice"
                                    value={formData.basePrice}
                                    onChange={handleChange}
                                    placeholder="Enter base price"
                                    step="0.01"
                                    min="0"
                                    disabled={loading}
                                />
                                {errors.basePrice && (
                                    <div className="invalid-feedback">{errors.basePrice}</div>
                                )}
                            </div>

                            {/* Discount Type */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Discount Type
                                </label>
                                <div className="d-flex gap-3">
                                    <div className="form-check d-flex align-items-center">
                                        <input
                                            className="form-check-input mt-0 me-2"
                                            type="radio"
                                            name="discountType"
                                            id="flat"
                                            value="flat"
                                            checked={formData.discountType === 'flat'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label mb-0" htmlFor="flat">
                                            Flat Amount
                                        </label>
                                    </div>
                                    <div className="form-check d-flex align-items-center">
                                        <input
                                            className="form-check-input mt-0 me-2"
                                            type="radio"
                                            name="discountType"
                                            id="percent"
                                            value="percent"
                                            checked={formData.discountType === 'percent'}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label mb-0" htmlFor="percent">
                                            Percentage (%)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Discount Value */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Discount Value
                                </label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.discountValue ? 'is-invalid' : ''}`}
                                    name="discountValue"
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    placeholder={formData.discountType === 'percent' ? 'Enter percentage (0-100)' : 'Enter discount amount'}
                                    step="0.01"
                                    min="0"
                                    max={formData.discountType === 'percent' ? '100' : undefined}
                                    disabled={loading}
                                />
                                <div className="form-text">
                                    {formData.discountType === 'percent'
                                        ? 'Enter percentage discount (0-100)'
                                        : 'Enter flat discount amount'}
                                </div>
                                {errors.discountValue && (
                                    <div className="invalid-feedback">{errors.discountValue}</div>
                                )}
                            </div>

                            {/* Currency */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Currency
                                </label>
                                <select
                                    className="form-select"
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="mb-20">
                                <h6 className="mb-3">Pricing Status</h6>
                                <div className="card border shadow-none bg-light">
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <label className="form-label fw-semibold mb-1">
                                                    Active Status
                                                </label>
                                                <p className="text-sm text-secondary mb-0">
                                                    {formData.status
                                                        ? 'This pricing is active and will be used in the store'
                                                        : 'This pricing is inactive and will not be applied'}
                                                </p>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <span className={`badge ${formData.status ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
                                                    {formData.status ? 'Active' : 'Inactive'}
                                                </span>
                                                <div className="form-check form-switch form-switch-lg m-0">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="status"
                                                        name="status"
                                                        checked={formData.status}
                                                        onChange={handleChange}
                                                        disabled={loading}
                                                        style={{ width: '48px', height: '24px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex align-items-center justify-content-end gap-3 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger text-danger-600 border-danger-600 d-flex align-items-center px-4 py-2"
                                    onClick={() => navigate('/product-pricing-list')}
                                    disabled={loading}
                                >
                                    <Icon icon="mdi:cancel" className="me-2" style={{ fontSize: '18px' }} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary-600 d-flex align-items-center px-4 py-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {isEditMode ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="material-symbols:save" className="me-2" style={{ fontSize: '18px' }} />
                                            {isEditMode ? 'Update Pricing' : 'Create Pricing'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Info Sidebar */}
            <div className="col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title mb-0">
                            <Icon icon="mdi:calculator" className="me-2" />
                            Price Calculator
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-sm text-secondary-light">Base Price:</span>
                                <span className="text-sm fw-semibold">{formData.currency} {parseFloat(formData.basePrice) || 0}</span>
                            </div>
                            {formData.discountValue > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-sm text-secondary-light">Discount:</span>
                                    <span className="text-sm text-success-600">
                                        - {formData.discountType === 'percent'
                                            ? `${formData.discountValue}%`
                                            : `${formData.currency} ${formData.discountValue}`}
                                    </span>
                                </div>
                            )}
                            <hr />
                            <div className="d-flex justify-content-between">
                                <span className="text-md fw-semibold">Final Price:</span>
                                <span className="text-md fw-bold text-primary-600">
                                    {formData.currency} {calculatedFinalPrice.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {formData.discountValue > 0 && (
                            <div className="alert alert-success-50 border-success-600 mb-0" role="alert">
                                <div className="text-sm">
                                    <strong>Savings:</strong> {formData.currency} {(parseFloat(formData.basePrice) - calculatedFinalPrice).toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card mt-3">
                    <div className="card-header">
                        <h6 className="card-title mb-0">
                            <Icon icon="solar:lightbulb-bold-duotone" className="me-2" />
                            Pricing Guidelines
                        </h6>
                    </div>
                    <div className="card-body">
                        <ul className="text-sm text-secondary-light mb-0" style={{ paddingLeft: '20px' }}>
                            <li className="mb-2">Set base price as the original product price</li>
                            <li className="mb-2">Use product-level pricing for simple products</li>
                            <li className="mb-2">Use variant-level pricing for products with SKU variations</li>
                            <li className="mb-2">Final price is automatically calculated</li>
                            <li className="mb-2">Only active pricing will be displayed to customers</li>
                            <li className="mb-2">You can update pricing anytime without affecting product data</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditProductPricingLayer;
