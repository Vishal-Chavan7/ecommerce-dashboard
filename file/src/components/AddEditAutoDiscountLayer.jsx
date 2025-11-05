import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddEditAutoDiscountLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        discountType: 'percent',
        value: '',
        minCartValue: '',
        applicableTo: {
            type: 'all',
            ids: []
        },
        priority: '1',
        startDate: '',
        endDate: '',
        status: 'active'
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
        if (isEditMode) {
            fetchAutoDiscount();
        }
    }, [id]);

    const fetchAutoDiscount = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/auto-discounts/${id}`);
            const discount = response.data.data;
            setFormData({
                title: discount.title || '',
                discountType: discount.discountType || 'percent',
                value: discount.value || '',
                minCartValue: discount.minCartValue || '',
                applicableTo: {
                    type: discount.applicableTo?.type || 'all',
                    ids: discount.applicableTo?.ids || []
                },
                priority: discount.priority || '1',
                startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
                endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
                status: discount.status || 'active'
            });
        } catch (error) {
            console.error('Error fetching auto discount:', error);
            toast.error('Failed to fetch auto discount');
            navigate('/auto-discounts-list');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleApplicableToTypeChange = (e) => {
        const type = e.target.value;
        setFormData(prev => ({
            ...prev,
            applicableTo: {
                type: type,
                ids: []
            }
        }));
    };

    const handleApplicableToIdsChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({
            ...prev,
            applicableTo: {
                ...prev.applicableTo,
                ids: selectedOptions
            }
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.value || parseFloat(formData.value) <= 0) {
            newErrors.value = 'Discount value must be greater than 0';
        }

        if (formData.discountType === 'percent' && parseFloat(formData.value) > 100) {
            newErrors.value = 'Percentage cannot exceed 100%';
        }

        if (formData.minCartValue && parseFloat(formData.minCartValue) < 0) {
            newErrors.minCartValue = 'Minimum cart value cannot be negative';
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }

        if (formData.applicableTo.type !== 'all' && formData.applicableTo.ids.length === 0) {
            newErrors.applicableToIds = `Please select at least one ${formData.applicableTo.type}`;
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
                discountType: formData.discountType,
                value: parseFloat(formData.value),
                minCartValue: formData.minCartValue ? parseFloat(formData.minCartValue) : undefined,
                applicableTo: {
                    type: formData.applicableTo.type,
                    ids: formData.applicableTo.type === 'all' ? [] : formData.applicableTo.ids
                },
                priority: parseInt(formData.priority) || 1,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/auto-discounts/${id}`, submitData);
                toast.success('Auto discount updated successfully');
            } else {
                await api.post('/admin/auto-discounts', submitData);
                toast.success('Auto discount created successfully');
            }

            navigate('/auto-discounts-list');
        } catch (error) {
            console.error('Error saving auto discount:', error);
            toast.error(error.response?.data?.message || 'Failed to save auto discount');
        } finally {
            setLoading(false);
        }
    };

    const getDiscountPreview = () => {
        if (!formData.value) return null;
        const value = parseFloat(formData.value);
        if (isNaN(value)) return null;

        const sampleCart = 1000;
        let discount = 0;
        let finalPrice = sampleCart;

        if (formData.discountType === 'percent') {
            discount = (sampleCart * value) / 100;
            finalPrice = sampleCart - discount;
        } else {
            discount = value;
            finalPrice = sampleCart - value;
        }

        const canApply = !formData.minCartValue || sampleCart >= parseFloat(formData.minCartValue);

        return {
            originalPrice: sampleCart,
            discount: discount.toFixed(2),
            finalPrice: finalPrice.toFixed(2),
            canApply
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
                        {isEditMode ? 'Edit Auto Discount' : 'Create New Auto Discount'}
                    </h4>
                    <p className="text-muted mb-0">
                        {isEditMode ? 'Update auto discount information' : 'Set up automatic discount rules for your store'}
                    </p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/auto-discounts-list')}
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
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Title <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g., Summer Sale - 20% OFF"
                                        />
                                        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Discount Type <span className="text-danger">*</span>
                                        </label>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div
                                                    className={`card cursor-pointer ${formData.discountType === 'percent' ? 'border-primary' : 'border'
                                                        }`}
                                                    onClick={() => setFormData(prev => ({ ...prev, discountType: 'percent' }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="discountType"
                                                                value="percent"
                                                                checked={formData.discountType === 'percent'}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="form-check-label w-100">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:percent" width="24" className="text-info me-2" />
                                                                    <div>
                                                                        <div className="fw-semibold">Percentage</div>
                                                                        <small className="text-muted">e.g., 20% off</small>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div
                                                    className={`card cursor-pointer ${formData.discountType === 'flat' ? 'border-primary' : 'border'
                                                        }`}
                                                    onClick={() => setFormData(prev => ({ ...prev, discountType: 'flat' }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="discountType"
                                                                value="flat"
                                                                checked={formData.discountType === 'flat'}
                                                                onChange={handleChange}
                                                            />
                                                            <label className="form-check-label w-100">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:currency-inr" width="24" className="text-warning me-2" />
                                                                    <div>
                                                                        <div className="fw-semibold">Flat Amount</div>
                                                                        <small className="text-muted">e.g., ₹100 off</small>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Discount Value <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            {formData.discountType === 'flat' && (
                                                <span className="input-group-text">₹</span>
                                            )}
                                            <input
                                                type="number"
                                                className={`form-control ${errors.value ? 'is-invalid' : ''}`}
                                                name="value"
                                                value={formData.value}
                                                onChange={handleChange}
                                                placeholder={formData.discountType === 'percent' ? '20' : '100'}
                                                step="0.01"
                                            />
                                            {formData.discountType === 'percent' && (
                                                <span className="input-group-text">%</span>
                                            )}
                                            {errors.value && <div className="invalid-feedback">{errors.value}</div>}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Minimum Cart Value
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">₹</span>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.minCartValue ? 'is-invalid' : ''}`}
                                                name="minCartValue"
                                                value={formData.minCartValue}
                                                onChange={handleChange}
                                                placeholder="500"
                                                step="0.01"
                                            />
                                            {errors.minCartValue && <div className="invalid-feedback">{errors.minCartValue}</div>}
                                        </div>
                                        <small className="text-muted">Leave empty for no minimum</small>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Priority
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            placeholder="1"
                                            min="1"
                                        />
                                        <small className="text-muted">Higher priority applies first (1 = highest)</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Applicable To */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:tag" className="me-2" />
                                    Applicable To
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Apply To <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            value={formData.applicableTo.type}
                                            onChange={handleApplicableToTypeChange}
                                        >
                                            <option value="all">Entire Store (Store-wide)</option>
                                            <option value="product">Specific Products</option>
                                            <option value="category">Specific Categories</option>
                                            <option value="brand">Specific Brands</option>
                                        </select>
                                    </div>

                                    {formData.applicableTo.type === 'product' && (
                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Select Products <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${errors.applicableToIds ? 'is-invalid' : ''}`}
                                                multiple
                                                size="8"
                                                value={formData.applicableTo.ids}
                                                onChange={handleApplicableToIdsChange}
                                            >
                                                {products.map(product => (
                                                    <option key={product._id} value={product._id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.applicableToIds && <div className="invalid-feedback">{errors.applicableToIds}</div>}
                                            <small className="text-muted">Hold Ctrl (Cmd on Mac) to select multiple</small>
                                        </div>
                                    )}

                                    {formData.applicableTo.type === 'category' && (
                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Select Categories <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${errors.applicableToIds ? 'is-invalid' : ''}`}
                                                multiple
                                                size="8"
                                                value={formData.applicableTo.ids}
                                                onChange={handleApplicableToIdsChange}
                                            >
                                                {categories.map(category => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.applicableToIds && <div className="invalid-feedback">{errors.applicableToIds}</div>}
                                            <small className="text-muted">Hold Ctrl (Cmd on Mac) to select multiple</small>
                                        </div>
                                    )}

                                    {formData.applicableTo.type === 'brand' && (
                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Select Brands <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${errors.applicableToIds ? 'is-invalid' : ''}`}
                                                multiple
                                                size="8"
                                                value={formData.applicableTo.ids}
                                                onChange={handleApplicableToIdsChange}
                                            >
                                                {brands.map(brand => (
                                                    <option key={brand._id} value={brand._id}>
                                                        {brand.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.applicableToIds && <div className="invalid-feedback">{errors.applicableToIds}</div>}
                                            <small className="text-muted">Hold Ctrl (Cmd on Mac) to select multiple</small>
                                        </div>
                                    )}
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
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                        />
                                        <small className="text-muted">Leave empty to start immediately</small>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">End Date</label>
                                        <input
                                            type="date"
                                            className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                        />
                                        {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                                        <small className="text-muted">Leave empty for no expiry</small>
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
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="statusSwitch"
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            status: e.target.checked ? 'active' : 'inactive'
                                        }))}
                                    />
                                    <label className="form-check-label" htmlFor="statusSwitch">
                                        {formData.status === 'active' ? 'Active' : 'Inactive'}
                                    </label>
                                </div>
                                <small className="text-muted">
                                    {formData.status === 'active'
                                        ? 'This auto discount will be applied automatically when conditions match'
                                        : 'This auto discount is disabled and will not be applied'}
                                </small>
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
                                        {isEditMode ? 'Update Auto Discount' : 'Create Auto Discount'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/auto-discounts-list')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Discount Preview */}
                    {preview && (
                        <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:calculator" className="me-2" />
                                    Discount Preview
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Original Cart:</span>
                                        <span className="fw-semibold">₹{preview.originalPrice}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Discount:</span>
                                        <span className="fw-bold">- ₹{preview.discount}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-semibold">Final Price:</span>
                                        <span className="fw-bold text-primary fs-5">₹{preview.finalPrice}</span>
                                    </div>
                                    {formData.minCartValue && (
                                        <div className="mt-3">
                                            {preview.canApply ? (
                                                <div className="alert alert-success py-2 mb-0">
                                                    <Icon icon="mdi:check-circle" className="me-1" />
                                                    Minimum cart value met
                                                </div>
                                            ) : (
                                                <div className="alert alert-warning py-2 mb-0">
                                                    <Icon icon="mdi:alert" className="me-1" />
                                                    Below minimum cart value
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <small className="text-muted">
                                    <Icon icon="mdi:information" className="me-1" />
                                    Preview based on ₹1000 cart
                                </small>
                            </div>
                        </div>
                    )}

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
                                <li className="mb-2">Use priority to control which discount applies first</li>
                                <li className="mb-2">Set minimum cart value to encourage larger purchases</li>
                                <li className="mb-2">Store-wide discounts apply to all products</li>
                                <li className="mb-2">Auto discounts are applied automatically at checkout</li>
                                <li className="mb-2">Higher priority (lower number) takes precedence</li>
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
                                    <strong>Festive Sales:</strong> 20-30% off store-wide
                                </li>
                                <li className="mb-2">
                                    <strong>Category Clearance:</strong> 40-50% off specific categories
                                </li>
                                <li className="mb-2">
                                    <strong>Cart Threshold:</strong> ₹100 off on ₹1000+ orders
                                </li>
                                <li className="mb-2">
                                    <strong>New Launch:</strong> 15% off on new product categories
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditAutoDiscountLayer;
