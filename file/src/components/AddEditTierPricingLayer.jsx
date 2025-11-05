import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditTierPricingLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        productId: '',
        variantId: '',
        minQty: '',
        maxQty: '',
        price: ''
    });

    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [filteredVariants, setFilteredVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        fetchVariants();
        if (isEditMode) {
            fetchTierPricingData();
        }
    }, [id]);

    useEffect(() => {
        if (formData.productId) {
            const filtered = variants.filter(v => v.productId === formData.productId);
            setFilteredVariants(filtered);
        } else {
            setFilteredVariants([]);
        }
    }, [formData.productId, variants]);

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

    const fetchTierPricingData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/pricing/tier/${id}`);
            const tierData = response.data;
            setFormData({
                productId: tierData.productId || '',
                variantId: tierData.variantId || '',
                minQty: tierData.minQty || '',
                maxQty: tierData.maxQty || '',
                price: tierData.price || ''
            });
        } catch (error) {
            console.error('Error fetching tier pricing:', error);
            toast.error('Failed to load tier pricing data');
            navigate('/tier-pricing-list');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.minQty || formData.minQty <= 0) {
            errors.minQty = 'Minimum quantity must be greater than 0';
        }

        if (!formData.maxQty || formData.maxQty <= 0) {
            errors.maxQty = 'Maximum quantity must be greater than 0';
        }

        if (formData.minQty && formData.maxQty && parseInt(formData.minQty) >= parseInt(formData.maxQty)) {
            errors.maxQty = 'Maximum quantity must be greater than minimum quantity';
        }

        if (!formData.price || formData.price <= 0) {
            errors.price = 'Price must be greater than 0';
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
                minQty: parseInt(formData.minQty),
                maxQty: parseInt(formData.maxQty),
                price: parseFloat(formData.price)
            };

            // Only include variantId if it's selected
            if (formData.variantId) {
                submitData.variantId = formData.variantId;
            }

            if (isEditMode) {
                await api.put(`/admin/pricing/tier/${id}`, submitData);
                toast.success('Tier pricing updated successfully');
            } else {
                await api.post('/admin/pricing/tier', submitData);
                toast.success('Tier pricing created successfully');
            }

            navigate('/tier-pricing-list');
        } catch (error) {
            console.error('Error saving tier pricing:', error);
            toast.error(error.response?.data?.message || 'Failed to save tier pricing');
        } finally {
            setLoading(false);
        }
    };

    const getPricingInfo = () => {
        const selectedProduct = products.find(p => p._id === formData.productId);
        if (!selectedProduct) return null;

        return {
            productName: selectedProduct.title,
            regularPrice: selectedProduct.price || 0
        };
    };

    const calculateDiscount = () => {
        const pricingInfo = getPricingInfo();
        if (!pricingInfo || !formData.price) return null;

        const discount = pricingInfo.regularPrice - parseFloat(formData.price);
        const discountPercentage = ((discount / pricingInfo.regularPrice) * 100).toFixed(2);

        return {
            discount: discount.toFixed(2),
            percentage: discountPercentage
        };
    };

    return (
        <div className="container-fluid">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex align-items-center mb-3">
                        <button
                            className="btn btn-link text-decoration-none me-3"
                            onClick={() => navigate('/tier-pricing-list')}
                        >
                            <Icon icon="mdi:arrow-left" style={{ fontSize: '24px' }} />
                        </button>
                        <div>
                            <h2 className="mb-1">
                                <Icon icon="mdi:chart-box-multiple" className="me-2" />
                                {isEditMode ? 'Edit Tier Pricing' : 'Add Tier Pricing'}
                            </h2>
                            <p className="text-muted mb-0">
                                {isEditMode ? 'Update bulk pricing rule' : 'Create new bulk pricing rule for wholesale orders'}
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
                                Tier Pricing Details
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
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.title} - ₹{product.price}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.productId && (
                                        <div className="invalid-feedback">{validationErrors.productId}</div>
                                    )}
                                    <small className="text-muted">
                                        Select the product for which you want to create tier pricing
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
                                        Leave empty to apply tier pricing to the entire product
                                    </small>
                                </div>

                                {/* Quantity Range */}
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            <Icon icon="mdi:package-variant" className="me-2" />
                                            Minimum Quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${validationErrors.minQty ? 'is-invalid' : ''}`}
                                            name="minQty"
                                            value={formData.minQty}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 5"
                                            min="1"
                                            disabled={loading}
                                        />
                                        {validationErrors.minQty && (
                                            <div className="invalid-feedback">{validationErrors.minQty}</div>
                                        )}
                                        <small className="text-muted">Starting quantity for this tier</small>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            <Icon icon="mdi:package-variant-closed" className="me-2" />
                                            Maximum Quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${validationErrors.maxQty ? 'is-invalid' : ''}`}
                                            name="maxQty"
                                            value={formData.maxQty}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 10 or 999999 for unlimited"
                                            min="1"
                                            disabled={loading}
                                        />
                                        {validationErrors.maxQty && (
                                            <div className="invalid-feedback">{validationErrors.maxQty}</div>
                                        )}
                                        <small className="text-muted">Ending quantity (use 999999 for unlimited)</small>
                                    </div>
                                </div>

                                {/* Quantity Range Preview */}
                                {formData.minQty && formData.maxQty && (
                                    <div className="alert alert-info mb-4">
                                        <Icon icon="mdi:information" className="me-2" />
                                        <strong>Quantity Range:</strong> {formData.minQty} - {formData.maxQty >= 999999 ? '∞' : formData.maxQty} units
                                    </div>
                                )}

                                {/* Tier Price */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <Icon icon="mdi:currency-inr" className="me-2" />
                                        Tier Price <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${validationErrors.price ? 'is-invalid' : ''}`}
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 650.00"
                                        step="0.01"
                                        min="0"
                                        disabled={loading}
                                    />
                                    {validationErrors.price && (
                                        <div className="invalid-feedback">{validationErrors.price}</div>
                                    )}
                                    <small className="text-muted">
                                        Price per unit when quantity is in this tier range
                                    </small>
                                </div>

                                {/* Discount Calculator */}
                                {formData.productId && formData.price && calculateDiscount() && (
                                    <div className="alert alert-success mb-4">
                                        <h6 className="alert-heading">
                                            <Icon icon="mdi:calculator" className="me-2" />
                                            Discount Calculation
                                        </h6>
                                        <hr />
                                        <div className="row">
                                            <div className="col-md-4">
                                                <small className="text-muted">Regular Price</small>
                                                <div className="h5">₹{getPricingInfo().regularPrice.toFixed(2)}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted">Tier Price</small>
                                                <div className="h5 text-success">₹{parseFloat(formData.price).toFixed(2)}</div>
                                            </div>
                                            <div className="col-md-4">
                                                <small className="text-muted">Discount</small>
                                                <div className="h5 text-danger">
                                                    -{calculateDiscount().percentage}%
                                                    <small className="ms-2">(₹{calculateDiscount().discount})</small>
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
                                                {isEditMode ? 'Update Tier Pricing' : 'Create Tier Pricing'}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/tier-pricing-list')}
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
                    {/* Pricing Calculator Preview */}
                    {formData.minQty && formData.maxQty && formData.price && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:calculator" className="me-2" />
                                    Tier Preview
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <small className="text-muted">Quantity Range</small>
                                    <div className="h5">
                                        {formData.minQty} - {formData.maxQty >= 999999 ? '∞' : formData.maxQty} units
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted">Price per Unit</small>
                                    <div className="h4 text-success mb-0">₹{parseFloat(formData.price).toFixed(2)}</div>
                                </div>
                                <hr />
                                <div>
                                    <small className="text-muted">Total for {formData.minQty} units</small>
                                    <div className="h5">₹{(formData.minQty * formData.price).toFixed(2)}</div>
                                </div>
                                <div className="mt-2">
                                    <small className="text-muted">Total for {formData.maxQty >= 999999 ? '100' : formData.maxQty} units</small>
                                    <div className="h5">
                                        ₹{((formData.maxQty >= 999999 ? 100 : formData.maxQty) * formData.price).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Guidelines Card */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0">
                                <Icon icon="mdi:information" className="me-2" />
                                Tier Pricing Guidelines
                            </h6>
                        </div>
                        <div className="card-body">
                            <h6 className="fw-semibold mb-3">Best Practices:</h6>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:check-circle" className="text-success me-2 mt-1" />
                                    <div>
                                        <strong>Define Clear Ranges</strong>
                                        <p className="text-muted small mb-0">
                                            Set non-overlapping quantity ranges (e.g., 1-4, 5-10, 11-50, 51+)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:check-circle" className="text-success me-2 mt-1" />
                                    <div>
                                        <strong>Incentivize Bulk Orders</strong>
                                        <p className="text-muted small mb-0">
                                            Offer better prices for higher quantities to encourage wholesale purchases
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:check-circle" className="text-success me-2 mt-1" />
                                    <div>
                                        <strong>Use 999999 for Unlimited</strong>
                                        <p className="text-muted small mb-0">
                                            For the highest tier, use 999999 as max quantity to indicate no upper limit
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="d-flex align-items-start">
                                    <Icon icon="mdi:check-circle" className="text-success me-2 mt-1" />
                                    <div>
                                        <strong>Variant-Specific Tiers</strong>
                                        <p className="text-muted small mb-0">
                                            Create different tiers for specific variants (colors/sizes) when needed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <h6 className="fw-semibold mb-3">Common Tier Examples:</h6>

                            <div className="small">
                                <div className="mb-2">
                                    <strong>Retail:</strong>
                                    <div className="text-muted">1-4: ₹700, 5-10: ₹650, 11+: ₹600</div>
                                </div>
                                <div className="mb-2">
                                    <strong>Wholesale:</strong>
                                    <div className="text-muted">1-9: ₹500, 10-49: ₹450, 50+: ₹400</div>
                                </div>
                                <div>
                                    <strong>Bulk Only:</strong>
                                    <div className="text-muted">100-499: ₹350, 500+: ₹300</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditTierPricingLayer;
