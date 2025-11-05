import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditCouponLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        code: '',
        type: 'percent',
        value: '',
        minOrderAmount: '',
        maxDiscount: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        usagePerUser: '',
        allowedUsers: [],
        allowedCategories: [],
        allowedProducts: [],
        allowedBrands: [],
        status: 'active'
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
        if (isEditMode) {
            fetchCouponData();
        }
    }, [id]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchCouponData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/coupons/${id}`);
            const coupon = response.data.data;

            const formatDateForInput = (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toISOString().split('T')[0];
            };

            setFormData({
                code: coupon.code || '',
                type: coupon.type || 'percent',
                value: coupon.value || '',
                minOrderAmount: coupon.minOrderAmount || '',
                maxDiscount: coupon.maxDiscount || '',
                startDate: formatDateForInput(coupon.startDate),
                endDate: formatDateForInput(coupon.endDate),
                usageLimit: coupon.usageLimit || '',
                usagePerUser: coupon.usagePerUser || '',
                allowedUsers: coupon.allowedUsers || [],
                allowedCategories: coupon.allowedCategories || [],
                allowedProducts: coupon.allowedProducts || [],
                allowedBrands: coupon.allowedBrands || [],
                status: coupon.status || 'active'
            });
        } catch (error) {
            console.error('Error fetching coupon:', error);
            toast.error('Failed to load coupon data');
            navigate('/coupons-list');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleMultiSelect = (name, value) => {
        setFormData(prev => {
            const currentValues = prev[name] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [name]: newValues };
        });
    };

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.code || formData.code.trim() === '') {
            errors.code = 'Coupon code is required';
        } else if (formData.code.length < 3) {
            errors.code = 'Coupon code must be at least 3 characters';
        }

        if (!formData.type) {
            errors.type = 'Discount type is required';
        }

        if (!formData.value || formData.value === '') {
            errors.value = 'Discount value is required';
        } else {
            const value = parseFloat(formData.value);
            if (isNaN(value) || value <= 0) {
                errors.value = 'Value must be a positive number';
            }
            if (formData.type === 'percent' && value > 100) {
                errors.value = 'Percentage cannot exceed 100%';
            }
        }

        if (formData.startDate && formData.endDate) {
            if (new Date(formData.endDate) < new Date(formData.startDate)) {
                errors.endDate = 'End date must be after start date';
            }
        }

        if (formData.usageLimit && parseInt(formData.usageLimit) < 1) {
            errors.usageLimit = 'Usage limit must be at least 1';
        }

        if (formData.usagePerUser && parseInt(formData.usagePerUser) < 1) {
            errors.usagePerUser = 'Usage per user must be at least 1';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
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
                code: formData.code.trim().toUpperCase(),
                type: formData.type,
                value: parseFloat(formData.value),
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
                usagePerUser: formData.usagePerUser ? parseInt(formData.usagePerUser) : undefined,
                allowedUsers: formData.allowedUsers.length > 0 ? formData.allowedUsers : undefined,
                allowedCategories: formData.allowedCategories.length > 0 ? formData.allowedCategories : undefined,
                allowedProducts: formData.allowedProducts.length > 0 ? formData.allowedProducts : undefined,
                allowedBrands: formData.allowedBrands.length > 0 ? formData.allowedBrands : undefined,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/coupons/${id}`, submitData);
                toast.success('Coupon updated successfully');
            } else {
                await api.post('/admin/coupons', submitData);
                toast.success('Coupon created successfully');
            }

            navigate('/coupons-list');
        } catch (error) {
            console.error('Error saving coupon:', error);
            toast.error(error.response?.data?.message || 'Failed to save coupon');
        } finally {
            setLoading(false);
        }
    };

    const getDiscountPreview = () => {
        if (!formData.value) return null;
        const value = parseFloat(formData.value);
        if (isNaN(value)) return null;

        const samplePrice = 1000;
        let discount = 0;
        let finalPrice = samplePrice;

        if (formData.type === 'percent') {
            discount = (samplePrice * value) / 100;
            if (formData.maxDiscount && discount > parseFloat(formData.maxDiscount)) {
                discount = parseFloat(formData.maxDiscount);
            }
            finalPrice = samplePrice - discount;
        } else {
            discount = value;
            finalPrice = samplePrice - value;
        }

        return {
            originalPrice: samplePrice,
            discount: discount.toFixed(2),
            finalPrice: finalPrice.toFixed(2)
        };
    };

    const preview = getDiscountPreview();

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
                        {isEditMode ? 'Edit Coupon' : 'Create New Coupon'}
                    </h4>
                    <p className="text-muted mb-0">
                        {isEditMode ? 'Update coupon information' : 'Add a new discount coupon for customers'}
                    </p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/coupons-list')}
                >
                    <Icon icon="mdi:arrow-left" className="me-1" />
                    Back to List
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row">
                    {/* Main Form Section */}
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
                                {/* Coupon Code */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:ticket" className="me-1" />
                                        Coupon Code <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className={`form-control text-uppercase ${validationErrors.code ? 'is-invalid' : ''}`}
                                            name="code"
                                            placeholder="e.g., SAVE20, NEWYEAR2024"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={generateCouponCode}
                                            disabled={loading}
                                        >
                                            <Icon icon="mdi:refresh" /> Generate
                                        </button>
                                        {validationErrors.code && (
                                            <div className="invalid-feedback">{validationErrors.code}</div>
                                        )}
                                    </div>
                                    <small className="text-muted">
                                        Unique code that customers will use at checkout
                                    </small>
                                </div>

                                {/* Discount Type */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:format-list-bulleted-type" className="me-1" />
                                        Discount Type <span className="text-danger">*</span>
                                    </label>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className={`form-check card p-3 ${formData.type === 'percent' ? 'border-info bg-light' : ''}`}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="type"
                                                    id="typePercent"
                                                    value="percent"
                                                    checked={formData.type === 'percent'}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label ms-2" htmlFor="typePercent">
                                                    <div className="d-flex align-items-center">
                                                        <Icon icon="mdi:percent" width="24" className="text-info me-2" />
                                                        <div>
                                                            <strong>Percentage</strong>
                                                            <small className="d-block text-muted">e.g., 20% off</small>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className={`form-check card p-3 ${formData.type === 'flat' ? 'border-warning bg-light' : ''}`}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="type"
                                                    id="typeFlat"
                                                    value="flat"
                                                    checked={formData.type === 'flat'}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label ms-2" htmlFor="typeFlat">
                                                    <div className="d-flex align-items-center">
                                                        <Icon icon="mdi:currency-inr" width="24" className="text-warning me-2" />
                                                        <div>
                                                            <strong>Flat Amount</strong>
                                                            <small className="d-block text-muted">e.g., ₹100 off</small>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Discount Value */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            <Icon icon="mdi:sale" className="me-1" />
                                            Discount Value <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            {formData.type === 'flat' && <span className="input-group-text">₹</span>}
                                            <input
                                                type="number"
                                                className={`form-control ${validationErrors.value ? 'is-invalid' : ''}`}
                                                name="value"
                                                placeholder={formData.type === 'percent' ? '20' : '100'}
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                                step={formData.type === 'percent' ? '0.01' : '1'}
                                                min="0"
                                                max={formData.type === 'percent' ? '100' : undefined}
                                            />
                                            {formData.type === 'percent' && <span className="input-group-text">%</span>}
                                            {validationErrors.value && (
                                                <div className="invalid-feedback">{validationErrors.value}</div>
                                            )}
                                        </div>
                                    </div>

                                    {formData.type === 'percent' && (
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                <Icon icon="mdi:cash-limit" className="me-1" />
                                                Max Discount (Optional)
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text">₹</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="maxDiscount"
                                                    placeholder="500"
                                                    value={formData.maxDiscount}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                    min="0"
                                                />
                                            </div>
                                            <small className="text-muted">Cap the maximum discount amount</small>
                                        </div>
                                    )}
                                </div>

                                {/* Min Order Amount */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:cart" className="me-1" />
                                        Minimum Order Amount (Optional)
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="minOrderAmount"
                                            placeholder="500"
                                            value={formData.minOrderAmount}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            min="0"
                                        />
                                    </div>
                                    <small className="text-muted">
                                        Minimum cart value required to use this coupon
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Validity Period */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:calendar-range" className="me-2" />
                                    Validity Period
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            <Icon icon="mdi:calendar-start" className="me-1" />
                                            Start Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <small className="text-muted">Leave empty for immediate activation</small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            <Icon icon="mdi:calendar-end" className="me-1" />
                                            End Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${validationErrors.endDate ? 'is-invalid' : ''}`}
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        {validationErrors.endDate && (
                                            <div className="invalid-feedback">{validationErrors.endDate}</div>
                                        )}
                                        <small className="text-muted">Leave empty for no expiration</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Limits */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:counter" className="me-2" />
                                    Usage Limits
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            <Icon icon="mdi:counter" className="me-1" />
                                            Total Usage Limit (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${validationErrors.usageLimit ? 'is-invalid' : ''}`}
                                            name="usageLimit"
                                            placeholder="100"
                                            value={formData.usageLimit}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            min="1"
                                        />
                                        {validationErrors.usageLimit && (
                                            <div className="invalid-feedback">{validationErrors.usageLimit}</div>
                                        )}
                                        <small className="text-muted">Maximum total uses for this coupon</small>
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            <Icon icon="mdi:account-multiple" className="me-1" />
                                            Usage Per User (Optional)
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${validationErrors.usagePerUser ? 'is-invalid' : ''}`}
                                            name="usagePerUser"
                                            placeholder="1"
                                            value={formData.usagePerUser}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            min="1"
                                        />
                                        {validationErrors.usagePerUser && (
                                            <div className="invalid-feedback">{validationErrors.usagePerUser}</div>
                                        )}
                                        <small className="text-muted">How many times each user can use it</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Restrictions */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:filter" className="me-2" />
                                    Restrictions (Optional)
                                </h5>
                            </div>
                            <div className="card-body">
                                <p className="text-muted small">
                                    Leave all empty to apply coupon to all products. Select specific items to restrict usage.
                                </p>

                                {/* Categories */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:shape" className="me-1" />
                                        Allowed Categories
                                    </label>
                                    <select
                                        className="form-select"
                                        multiple
                                        size="4"
                                        value={formData.allowedCategories}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData(prev => ({ ...prev, allowedCategories: selected }));
                                        }}
                                        disabled={loading}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Hold Ctrl/Cmd to select multiple. {formData.allowedCategories.length} selected.
                                    </small>
                                </div>

                                {/* Brands */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:tag" className="me-1" />
                                        Allowed Brands
                                    </label>
                                    <select
                                        className="form-select"
                                        multiple
                                        size="4"
                                        value={formData.allowedBrands}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData(prev => ({ ...prev, allowedBrands: selected }));
                                        }}
                                        disabled={loading}
                                    >
                                        {brands.map(brand => (
                                            <option key={brand._id} value={brand._id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Hold Ctrl/Cmd to select multiple. {formData.allowedBrands.length} selected.
                                    </small>
                                </div>

                                {/* Products */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        <Icon icon="mdi:package-variant" className="me-1" />
                                        Allowed Products
                                    </label>
                                    <select
                                        className="form-select"
                                        multiple
                                        size="5"
                                        value={formData.allowedProducts}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setFormData(prev => ({ ...prev, allowedProducts: selected }));
                                        }}
                                        disabled={loading}
                                    >
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.title}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Hold Ctrl/Cmd to select multiple. {formData.allowedProducts.length} selected.
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="status"
                                        id="status"
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            status: e.target.checked ? 'active' : 'inactive'
                                        }))}
                                        disabled={loading}
                                    />
                                    <label className="form-check-label" htmlFor="status">
                                        <Icon icon={formData.status === 'active' ? 'mdi:check-circle' : 'mdi:pause-circle'} className="me-1" />
                                        {formData.status === 'active' ? 'Active' : 'Inactive'}
                                    </label>
                                </div>
                                <small className="text-muted">
                                    Only active coupons can be used by customers
                                </small>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="d-flex gap-2 mb-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:check" className="me-1" />
                                        {isEditMode ? 'Update Coupon' : 'Create Coupon'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/coupons-list')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Discount Preview */}
                        {preview && (
                            <div className="card border-0 shadow-sm mb-3 sticky-top" style={{ top: '20px' }}>
                                <div className="card-body">
                                    <h6 className="card-title">
                                        <Icon icon="mdi:calculator" className="me-2" />
                                        Discount Preview
                                    </h6>
                                    <div className="mt-3">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Original Price:</span>
                                            <span className="fw-medium">₹{preview.originalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Discount:</span>
                                            <span className="text-danger fw-medium">- ₹{preview.discount}</span>
                                        </div>
                                        <hr />
                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold">Final Price:</span>
                                            <span className="fw-bold text-success">₹{preview.finalPrice}</span>
                                        </div>
                                        <div className="alert alert-success mt-3 mb-0">
                                            <small>
                                                <Icon icon="mdi:check" className="me-1" />
                                                Customer saves ₹{preview.discount}!
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Tips */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body">
                                <h6 className="card-title">
                                    <Icon icon="mdi:lightbulb" className="me-2 text-warning" />
                                    Quick Tips
                                </h6>
                                <ul className="small mb-0 ps-3">
                                    <li className="mb-2">Use uppercase codes (e.g., SUMMER2024)</li>
                                    <li className="mb-2">Set minimum order amount to protect margins</li>
                                    <li className="mb-2">Use max discount cap for percentage coupons</li>
                                    <li className="mb-2">Limit usage per user to prevent abuse</li>
                                    <li>Test coupons before going live</li>
                                </ul>
                            </div>
                        </div>

                        {/* Best Practices */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="card-title">
                                    <Icon icon="mdi:check-circle" className="me-2 text-success" />
                                    Best Practices
                                </h6>
                                <div className="small">
                                    <div className="mb-2">
                                        <strong>Welcome Discounts:</strong>
                                        <p className="text-muted mb-0">10-15% for first-time buyers</p>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Seasonal Sales:</strong>
                                        <p className="text-muted mb-0">20-30% during festive seasons</p>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Flash Sales:</strong>
                                        <p className="text-muted mb-0">High discount, short duration, limited quantity</p>
                                    </div>
                                    <div>
                                        <strong>Cart Abandonment:</strong>
                                        <p className="text-muted mb-0">Send personalized 10-15% discount codes</p>
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

export default AddEditCouponLayer;
