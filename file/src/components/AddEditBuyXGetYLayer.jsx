import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddEditBuyXGetYLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        buy: {
            quantity: '1',
            products: [],
            categories: []
        },
        get: {
            quantity: '1',
            products: [],
            discountType: 'free',
            value: ''
        },
        startDate: '',
        endDate: '',
        status: 'active'
    });

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        if (isEditMode) {
            fetchOffer();
        }
    }, [id]);

    const fetchOffer = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/buy-x-get-y/${id}`);
            const offer = response.data.data;
            setFormData({
                title: offer.title || '',
                buy: {
                    quantity: offer.buy?.quantity?.toString() || '1',
                    products: offer.buy?.products || [],
                    categories: offer.buy?.categories || []
                },
                get: {
                    quantity: offer.get?.quantity?.toString() || '1',
                    products: offer.get?.products || [],
                    discountType: offer.get?.discountType || 'free',
                    value: offer.get?.value?.toString() || ''
                },
                startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
                endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
                status: offer.status || 'active'
            });
        } catch (error) {
            console.error('Error fetching offer:', error);
            toast.error('Failed to fetch offer');
            navigate('/buy-x-get-y-list');
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

    const handleBuyChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            buy: {
                ...prev.buy,
                [name]: value
            }
        }));
    };

    const handleBuyProductsChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({
            ...prev,
            buy: {
                ...prev.buy,
                products: selectedOptions
            }
        }));
        if (errors.buyProducts) {
            setErrors(prev => ({ ...prev, buyProducts: '' }));
        }
    };

    const handleBuyCategoriesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({
            ...prev,
            buy: {
                ...prev.buy,
                categories: selectedOptions
            }
        }));
    };

    const handleGetChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            get: {
                ...prev.get,
                [name]: value
            }
        }));
        if (errors[`get${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
            setErrors(prev => ({ ...prev, [`get${name.charAt(0).toUpperCase() + name.slice(1)}`]: '' }));
        }
    };

    const handleGetProductsChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({
            ...prev,
            get: {
                ...prev.get,
                products: selectedOptions
            }
        }));
        if (errors.getProducts) {
            setErrors(prev => ({ ...prev, getProducts: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.buy.quantity || parseInt(formData.buy.quantity) <= 0) {
            newErrors.buyQuantity = 'Buy quantity must be greater than 0';
        }

        if (formData.buy.products.length === 0 && formData.buy.categories.length === 0) {
            newErrors.buyProducts = 'Select at least one product or category to buy';
        }

        if (!formData.get.quantity || parseInt(formData.get.quantity) <= 0) {
            newErrors.getQuantity = 'Get quantity must be greater than 0';
        }

        if (formData.get.discountType !== 'free') {
            if (!formData.get.value || parseFloat(formData.get.value) <= 0) {
                newErrors.getValue = 'Discount value must be greater than 0';
            }
            if (formData.get.discountType === 'percent' && parseFloat(formData.get.value) > 100) {
                newErrors.getValue = 'Percentage cannot exceed 100%';
            }
        }

        if (formData.get.products.length === 0) {
            newErrors.getProducts = 'Select at least one product to get';
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
                buy: {
                    quantity: parseInt(formData.buy.quantity),
                    products: formData.buy.products,
                    categories: formData.buy.categories
                },
                get: {
                    quantity: parseInt(formData.get.quantity),
                    products: formData.get.products,
                    discountType: formData.get.discountType,
                    value: formData.get.discountType === 'free' ? undefined : parseFloat(formData.get.value)
                },
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/buy-x-get-y/${id}`, submitData);
                toast.success('Buy X Get Y offer updated successfully');
            } else {
                await api.post('/admin/buy-x-get-y', submitData);
                toast.success('Buy X Get Y offer created successfully');
            }

            navigate('/buy-x-get-y-list');
        } catch (error) {
            console.error('Error saving offer:', error);
            toast.error(error.response?.data?.message || 'Failed to save offer');
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
                        {isEditMode ? 'Edit Buy X Get Y Offer' : 'Create Buy X Get Y Offer'}
                    </h4>
                    <p className="text-muted mb-0">
                        {isEditMode ? 'Update offer information' : 'Set up Buy X Get Y promotional offer'}
                    </p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/buy-x-get-y-list')}
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
                                        placeholder="e.g., Buy 2 Get 1 Free on T-Shirts"
                                    />
                                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Buy Condition */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:cart" className="me-2" />
                                    Buy Condition
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Buy Quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.buyQuantity ? 'is-invalid' : ''}`}
                                            name="quantity"
                                            value={formData.buy.quantity}
                                            onChange={handleBuyChange}
                                            placeholder="2"
                                            min="1"
                                        />
                                        {errors.buyQuantity && <div className="invalid-feedback">{errors.buyQuantity}</div>}
                                        <small className="text-muted">Number of items customer must buy</small>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Buy Products <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.buyProducts ? 'is-invalid' : ''}`}
                                            multiple
                                            size="6"
                                            value={formData.buy.products}
                                            onChange={handleBuyProductsChange}
                                        >
                                            {products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.buyProducts && <div className="invalid-feedback">{errors.buyProducts}</div>}
                                        <small className="text-muted">Hold Ctrl (Cmd on Mac) to select multiple</small>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Or Buy from Categories (Optional)
                                        </label>
                                        <select
                                            className="form-select"
                                            multiple
                                            size="4"
                                            value={formData.buy.categories}
                                            onChange={handleBuyCategoriesChange}
                                        >
                                            {categories.map(category => (
                                                <option key={category._id} value={category._id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-muted">Any product from these categories will qualify</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Get Reward */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:gift" className="me-2" />
                                    Get Reward
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Get Quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.getQuantity ? 'is-invalid' : ''}`}
                                            name="quantity"
                                            value={formData.get.quantity}
                                            onChange={handleGetChange}
                                            placeholder="1"
                                            min="1"
                                        />
                                        {errors.getQuantity && <div className="invalid-feedback">{errors.getQuantity}</div>}
                                        <small className="text-muted">Number of items customer gets as reward</small>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Discount Type <span className="text-danger">*</span>
                                        </label>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <div
                                                    className={`card cursor-pointer ${formData.get.discountType === 'free' ? 'border-primary' : 'border'
                                                        }`}
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        get: { ...prev.get, discountType: 'free', value: '' }
                                                    }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="discountType"
                                                                value="free"
                                                                checked={formData.get.discountType === 'free'}
                                                                onChange={handleGetChange}
                                                            />
                                                            <label className="form-check-label w-100">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:gift" width="24" className="text-success me-2" />
                                                                    <div>
                                                                        <div className="fw-semibold">Free</div>
                                                                        <small className="text-muted">100% off</small>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div
                                                    className={`card cursor-pointer ${formData.get.discountType === 'percent' ? 'border-primary' : 'border'
                                                        }`}
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        get: { ...prev.get, discountType: 'percent' }
                                                    }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="discountType"
                                                                value="percent"
                                                                checked={formData.get.discountType === 'percent'}
                                                                onChange={handleGetChange}
                                                            />
                                                            <label className="form-check-label w-100">
                                                                <div className="d-flex align-items-center">
                                                                    <Icon icon="mdi:percent" width="24" className="text-info me-2" />
                                                                    <div>
                                                                        <div className="fw-semibold">Percentage</div>
                                                                        <small className="text-muted">e.g., 50% off</small>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div
                                                    className={`card cursor-pointer ${formData.get.discountType === 'flat' ? 'border-primary' : 'border'
                                                        }`}
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        get: { ...prev.get, discountType: 'flat' }
                                                    }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="card-body p-3">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="radio"
                                                                name="discountType"
                                                                value="flat"
                                                                checked={formData.get.discountType === 'flat'}
                                                                onChange={handleGetChange}
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

                                    {formData.get.discountType !== 'free' && (
                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Discount Value <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                {formData.get.discountType === 'flat' && (
                                                    <span className="input-group-text">₹</span>
                                                )}
                                                <input
                                                    type="number"
                                                    className={`form-control ${errors.getValue ? 'is-invalid' : ''}`}
                                                    name="value"
                                                    value={formData.get.value}
                                                    onChange={handleGetChange}
                                                    placeholder={formData.get.discountType === 'percent' ? '50' : '100'}
                                                    step="0.01"
                                                />
                                                {formData.get.discountType === 'percent' && (
                                                    <span className="input-group-text">%</span>
                                                )}
                                                {errors.getValue && <div className="invalid-feedback">{errors.getValue}</div>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Get Products <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className={`form-select ${errors.getProducts ? 'is-invalid' : ''}`}
                                            multiple
                                            size="6"
                                            value={formData.get.products}
                                            onChange={handleGetProductsChange}
                                        >
                                            {products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.getProducts && <div className="invalid-feedback">{errors.getProducts}</div>}
                                        <small className="text-muted">Products customer will receive as reward</small>
                                    </div>
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
                                        ? 'This offer will be applied automatically when conditions match'
                                        : 'This offer is disabled and will not be applied'}
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
                                        {isEditMode ? 'Update Offer' : 'Create Offer'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/buy-x-get-y-list')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Offer Preview */}
                    <div className="card border-0 shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-primary text-white">
                            <h6 className="mb-0">
                                <Icon icon="mdi:eye" className="me-2" />
                                Offer Preview
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-3">
                                <div className="badge bg-primary mb-2 fs-6">
                                    Buy {formData.buy.quantity || 0}
                                </div>
                                <Icon icon="mdi:arrow-down" width="24" className="text-primary d-block mx-auto my-2" />
                                <div className="badge bg-success fs-6">
                                    Get {formData.get.quantity || 0}
                                    {formData.get.discountType === 'free' && ' FREE'}
                                    {formData.get.discountType === 'percent' && formData.get.value && ` at ${formData.get.value}% OFF`}
                                    {formData.get.discountType === 'flat' && formData.get.value && ` at ₹${formData.get.value} OFF`}
                                </div>
                            </div>
                            <hr />
                            <div className="small">
                                <div className="mb-2">
                                    <strong>Buy:</strong>
                                    <div className="text-muted">
                                        {formData.buy.products.length > 0
                                            ? `${formData.buy.products.length} product(s) selected`
                                            : 'No products selected'}
                                    </div>
                                    {formData.buy.categories.length > 0 && (
                                        <div className="text-muted">
                                            + {formData.buy.categories.length} category(ies)
                                        </div>
                                    )}
                                </div>
                                <div className="mb-2">
                                    <strong>Get:</strong>
                                    <div className="text-muted">
                                        {formData.get.products.length > 0
                                            ? `${formData.get.products.length} product(s) selected`
                                            : 'No products selected'}
                                    </div>
                                </div>
                            </div>
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
                                <li className="mb-2">Buy and Get products can be same or different</li>
                                <li className="mb-2">Use categories to apply offer to multiple products</li>
                                <li className="mb-2">Free = 100% discount on reward items</li>
                                <li className="mb-2">Offer applies automatically when cart matches conditions</li>
                                <li className="mb-2">Customers must buy exact quantity to qualify</li>
                            </ul>
                        </div>
                    </div>

                    {/* Examples */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white">
                            <h6 className="mb-0">
                                <Icon icon="mdi:star" className="me-2" />
                                Popular Examples
                            </h6>
                        </div>
                        <div className="card-body">
                            <ul className="small mb-0 ps-3">
                                <li className="mb-2">
                                    <strong>Buy 2 Get 1 Free:</strong> T-Shirts
                                </li>
                                <li className="mb-2">
                                    <strong>Buy Shirt Get Tie 50% OFF:</strong> Cross-sell
                                </li>
                                <li className="mb-2">
                                    <strong>Buy 3 Get 1 Free:</strong> Same product
                                </li>
                                <li className="mb-2">
                                    <strong>Buy Laptop Get Mouse Free:</strong> Bundle deal
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditBuyXGetYLayer;
