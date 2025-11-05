import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditSpecialPricingLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        productId: '',
        variantId: '',
        specialPrice: '',
        startDate: '',
        endDate: '',
        status: true
    });

    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [productPricing, setProductPricing] = useState([]); // Add product pricing state
    const [filteredVariants, setFilteredVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchVariants();
        fetchProductPricing(); // Fetch product pricing
        if (isEditMode) {
            fetchSpecialPricingData();
        }
    }, [id]);

    useEffect(() => {
        if (formData.productId) {
            const filtered = variants.filter(v => v.productId === formData.productId);
            setFilteredVariants(filtered);
            const product = products.find(p => p._id === formData.productId);

            // Get pricing for the selected product
            const pricing = productPricing.find(p => p.productId === formData.productId);
            setSelectedProduct({
                ...product,
                price: pricing ? (pricing.finalPrice || pricing.price || 0) : 0
            });
        } else {
            setFilteredVariants([]);
            setSelectedProduct(null);
        }
    }, [formData.productId, variants, products, productPricing]);

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

    const fetchProductPricing = async () => {
        try {
            const response = await api.get('/admin/pricing');
            setProductPricing(response.data || []);
        } catch (error) {
            console.error('Error fetching product pricing:', error);
            toast.error('Failed to load product pricing');
        }
    };

    const fetchSpecialPricingData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/pricing/special/${id}`);
            const specialData = response.data;

            // Format dates for input fields
            const formatDateForInput = (date) => {
                if (!date) return '';
                const d = new Date(date);
                return d.toISOString().split('T')[0];
            };

            setFormData({
                productId: specialData.productId || '',
                variantId: specialData.variantId || '',
                specialPrice: specialData.specialPrice || '',
                startDate: formatDateForInput(specialData.startDate),
                endDate: formatDateForInput(specialData.endDate),
                status: specialData.status !== undefined ? specialData.status : true
            });
        } catch (error) {
            console.error('Error fetching special pricing:', error);
            toast.error('Failed to load special pricing data');
            navigate('/special-pricing-list');
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

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.productId) {
            errors.productId = 'Product is required';
        }

        if (!formData.specialPrice || formData.specialPrice <= 0) {
            errors.specialPrice = 'Special price must be greater than 0';
        }

        if (!formData.startDate) {
            errors.startDate = 'Start date is required';
        }

        if (!formData.endDate) {
            errors.endDate = 'End date is required';
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);

            if (end <= start) {
                errors.endDate = 'End date must be after start date';
            }
        }

        // Validate special price is less than regular price
        if (selectedProduct && formData.specialPrice >= selectedProduct.price) {
            errors.specialPrice = 'Special price must be less than regular price';
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
                productId: formData.productId,
                specialPrice: parseFloat(formData.specialPrice),
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status
            };

            // Only include variantId if it's selected
            if (formData.variantId) {
                submitData.variantId = formData.variantId;
            }

            if (isEditMode) {
                await api.put(`/admin/pricing/special/${id}`, submitData);
                toast.success('Special pricing updated successfully');
            } else {
                await api.post('/admin/pricing/special', submitData);
                toast.success('Special pricing created successfully');
            }

            navigate('/special-pricing-list');
        } catch (error) {
            console.error('Error saving special pricing:', error);
            toast.error(error.response?.data?.message || 'Failed to save special pricing');
        } finally {
            setLoading(false);
        }
    };

    const calculateDiscount = () => {
        if (!selectedProduct || !selectedProduct.price || !formData.specialPrice) return null;

        const regularPrice = parseFloat(selectedProduct.price) || 0;
        const specialPrice = parseFloat(formData.specialPrice) || 0;

        if (regularPrice <= 0 || specialPrice <= 0) return null;

        const discount = regularPrice - specialPrice;
        const discountPercentage = ((discount / regularPrice) * 100).toFixed(2);

        return {
            regularPrice,
            discount: discount.toFixed(2),
            percentage: discountPercentage
        };
    };

    const getDuration = () => {
        if (!formData.startDate || !formData.endDate) return null;

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    const getOfferStatus = () => {
        if (!formData.startDate || !formData.endDate) return null;

        const now = new Date();
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (now < start) return 'upcoming';
        if (now > end) return 'expired';
        return 'current';
    };

    const discountInfo = calculateDiscount();
    const duration = getDuration();
    const offerStatus = getOfferStatus();

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex align-items-center mb-3">
                        <button
                            className="btn btn-link text-decoration-none me-3"
                            onClick={() => navigate('/special-pricing-list')}
                        >
                            <Icon icon="mdi:arrow-left" style={{ fontSize: '24px' }} />
                        </button>
                        <div>
                            <h2 className="mb-1">
                                <Icon icon="mdi:tag-multiple" className="me-2" />
                                {isEditMode ? 'Edit Special Pricing' : 'Add Special Pricing'}
                            </h2>
                            <p className="text-muted mb-0">
                                {isEditMode ? 'Update promotional pricing offer' : 'Create new time-based promotional offer'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Form Section */}
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">
                                <Icon icon="mdi:form-textbox" className="me-2" />
                                Special Pricing Details
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Product Selection */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <Icon icon="solar:box-bold-duotone" className="me-2" />
                                        Product <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.productId ? 'is-invalid' : ''}`}
                                        name="productId"
                                        value={formData.productId}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        <option value="">Select a product</option>
                                        {products.map(product => {
                                            const pricing = productPricing.find(p => p.productId === product._id);
                                            const displayPrice = pricing ? (pricing.finalPrice || pricing.price || 0) : 0;
                                            return (
                                                <option key={product._id} value={product._id}>
                                                    {product.title} - ₹{displayPrice.toFixed(2)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {validationErrors.productId && (
                                        <div className="invalid-feedback">{validationErrors.productId}</div>
                                    )}
                                    <small className="text-muted">
                                        Select the product for this special pricing offer
                                    </small>
                                </div>

                                {/* Variant Selection */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <Icon icon="mdi:palette" className="me-2" />
                                        Variant (Optional)
                                    </label>
                                    <select
                                        className="form-select"
                                        name="variantId"
                                        value={formData.variantId}
                                        onChange={handleInputChange}
                                        disabled={!formData.productId || loading}
                                    >
                                        <option value="">No specific variant (applies to all)</option>
                                        {filteredVariants.map(variant => (
                                            <option key={variant._id} value={variant._id}>
                                                {variant.sku} - {variant.color} {variant.size}
                                            </option>
                                        ))}
                                    </select>
                                    <small className="text-muted">
                                        Leave empty to apply special pricing to the entire product
                                    </small>
                                </div>

                                {/* Special Price */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <Icon icon="mdi:tag" className="me-2" />
                                        Special Price <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            type="number"
                                            className={`form-control ${validationErrors.specialPrice ? 'is-invalid' : ''}`}
                                            name="specialPrice"
                                            value={formData.specialPrice}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 599.00"
                                            step="0.01"
                                            min="0"
                                            disabled={loading}
                                        />
                                        {validationErrors.specialPrice && (
                                            <div className="invalid-feedback">{validationErrors.specialPrice}</div>
                                        )}
                                    </div>
                                    <small className="text-muted">
                                        Must be less than regular price
                                        {selectedProduct && ` (Regular: ₹${selectedProduct.price})`}
                                    </small>
                                </div>

                                {/* Date Range */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            <Icon icon="mdi:calendar-start" className="me-2" />
                                            Start Date <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${validationErrors.startDate ? 'is-invalid' : ''}`}
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        {validationErrors.startDate && (
                                            <div className="invalid-feedback">{validationErrors.startDate}</div>
                                        )}
                                        <small className="text-muted">When the offer begins</small>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            <Icon icon="mdi:calendar-end" className="me-2" />
                                            End Date <span className="text-danger">*</span>
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
                                        <small className="text-muted">When the offer ends</small>
                                    </div>
                                </div>

                                {/* Duration Display */}
                                {duration !== null && (
                                    <div className="alert alert-info mb-4">
                                        <Icon icon="mdi:calendar-clock" className="me-2" />
                                        <strong>Offer Duration:</strong> {duration} day{duration !== 1 ? 's' : ''}
                                        {offerStatus && (
                                            <span className="ms-3">
                                                <Icon icon="mdi:information" className="me-1" />
                                                <strong>Status:</strong> {' '}
                                                {offerStatus === 'current' && <span className="text-success">Currently Active</span>}
                                                {offerStatus === 'upcoming' && <span className="text-info">Starts in Future</span>}
                                                {offerStatus === 'expired' && <span className="text-secondary">Already Ended</span>}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Status Toggle */}
                                <div className="mb-4">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="status"
                                            checked={formData.status}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <label className="form-check-label fw-semibold">
                                            <Icon icon="mdi:toggle-switch" className="me-2" />
                                            Enable This Offer
                                        </label>
                                    </div>
                                    <small className="text-muted">
                                        Disabled offers won't be applied even during the date range
                                    </small>
                                </div>

                                {/* Discount Preview */}
                                {discountInfo && discountInfo.regularPrice && formData.specialPrice > 0 && (
                                    <div className="alert alert-success mb-4">
                                        <h6 className="alert-heading">
                                            <Icon icon="mdi:calculator" className="me-2" />
                                            Discount Preview
                                        </h6>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-4">
                                                <small className="text-muted">Regular Price</small>
                                                <div className="h5 text-muted text-decoration-line-through">
                                                    ₹{Number(discountInfo.regularPrice).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted">Special Price</small>
                                                <div className="h5 text-danger">
                                                    ₹{Number(formData.specialPrice).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted">You Save</small>
                                                <div className="h5 text-success">
                                                    {discountInfo.percentage}% OFF
                                                    <small className="ms-2">(₹{discountInfo.discount})</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="d-flex gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                {isEditMode ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon="mdi:content-save" className="me-2" />
                                                {isEditMode ? 'Update Special Pricing' : 'Create Special Pricing'}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/special-pricing-list')}
                                        disabled={loading}
                                    >
                                        <Icon icon="mdi:close" className="me-2" />
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Guidelines */}
                <div className="col-lg-4">
                    {/* Quick Tips Card */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-warning text-dark">
                            <h6 className="mb-0">
                                <Icon icon="mdi:lightbulb" className="me-2" />
                                Quick Tips
                            </h6>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                <li className="mb-2">
                                    <Icon icon="mdi:check" className="text-success me-2" />
                                    <strong>Plan Ahead:</strong> Set up offers in advance for upcoming sales
                                </li>
                                <li className="mb-2">
                                    <Icon icon="mdi:check" className="text-success me-2" />
                                    <strong>Clear Dates:</strong> Ensure start and end dates don't overlap for same product
                                </li>
                                <li className="mb-2">
                                    <Icon icon="mdi:check" className="text-success me-2" />
                                    <strong>Test First:</strong> Create a short test offer to verify pricing logic
                                </li>
                                <li>
                                    <Icon icon="mdi:check" className="text-success me-2" />
                                    <strong>Monitor:</strong> Check active offers regularly and disable if needed
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Guidelines Card */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0">
                                <Icon icon="mdi:information" className="me-2" />
                                Special Pricing Guidelines
                            </h6>
                        </div>
                        <div className="card-body">
                            <h6 className="fw-semibold mb-3">Common Use Cases:</h6>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:star" className="text-warning me-2 mt-1" />
                                    <div>
                                        <strong>Flash Sales</strong>
                                        <p className="text-muted small mb-0">
                                            24-48 hour deep discounts (40-60% off)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:calendar-weekend" className="text-primary me-2 mt-1" />
                                    <div>
                                        <strong>Weekend Deals</strong>
                                        <p className="text-muted small mb-0">
                                            Friday to Sunday recurring offers
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:party-popper" className="text-danger me-2 mt-1" />
                                    <div>
                                        <strong>Festive Sales</strong>
                                        <p className="text-muted small mb-0">
                                            Holiday season, Diwali, Christmas (1-2 weeks)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:clock-fast" className="text-success me-2 mt-1" />
                                    <div>
                                        <strong>Clearance</strong>
                                        <p className="text-muted small mb-0">
                                            End of season, old inventory (30-60 days)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <h6 className="fw-semibold mb-2">Best Practices:</h6>
                            <ul className="small text-muted mb-0">
                                <li>Keep special prices at least 10% below regular price</li>
                                <li>Avoid overlapping date ranges for same product</li>
                                <li>Use variant-specific pricing for targeted offers</li>
                                <li>Review and extend popular offers before they expire</li>
                                <li>Disable unused offers to keep data clean</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditSpecialPricingLayer;
