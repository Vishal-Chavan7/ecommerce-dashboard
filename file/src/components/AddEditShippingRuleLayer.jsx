import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddEditShippingRuleLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        minOrderValue: 0,
        maxOrderValue: '',
        shippingCost: 0,
        country: '',
        state: '',
        postalCodes: [],
        status: true
    });

    const [postalCodeInput, setPostalCodeInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingRule, setFetchingRule] = useState(false);
    const [errors, setErrors] = useState({});
    const [noMaxLimit, setNoMaxLimit] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchShippingRule();
        }
    }, [id]);

    const fetchShippingRule = async () => {
        try {
            setFetchingRule(true);
            const response = await api.get(`/admin/shipping-rules/${id}`);
            const rule = response.data.data;

            setFormData({
                title: rule.title || '',
                minOrderValue: rule.minOrderValue || 0,
                maxOrderValue: rule.maxOrderValue === Number.MAX_SAFE_INTEGER ? '' : rule.maxOrderValue,
                shippingCost: rule.shippingCost || 0,
                country: rule.country || '',
                state: rule.state || '',
                postalCodes: rule.postalCodes || [],
                status: rule.status !== undefined ? rule.status : true
            });

            if (rule.maxOrderValue === Number.MAX_SAFE_INTEGER) {
                setNoMaxLimit(true);
            }
        } catch (error) {
            console.error('Error fetching shipping rule:', error);
            toast.error('Failed to fetch shipping rule details');
            navigate('/shipping-rules-list');
        } finally {
            setFetchingRule(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddPostalCode = () => {
        const code = postalCodeInput.trim();
        if (!code) {
            toast.warning('Please enter a postal code');
            return;
        }

        if (formData.postalCodes.includes(code)) {
            toast.warning('Postal code already added');
            return;
        }

        setFormData(prev => ({
            ...prev,
            postalCodes: [...prev.postalCodes, code]
        }));
        setPostalCodeInput('');
    };

    const handleRemovePostalCode = (code) => {
        setFormData(prev => ({
            ...prev,
            postalCodes: prev.postalCodes.filter(c => c !== code)
        }));
    };

    const handleNoMaxLimitChange = (e) => {
        const checked = e.target.checked;
        setNoMaxLimit(checked);
        if (checked) {
            setFormData(prev => ({ ...prev, maxOrderValue: '' }));
            setErrors(prev => ({ ...prev, maxOrderValue: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Title validation
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        // Country validation
        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        // Min order value validation
        if (formData.minOrderValue < 0) {
            newErrors.minOrderValue = 'Minimum order value cannot be negative';
        }

        // Max order value validation
        if (!noMaxLimit) {
            if (!formData.maxOrderValue || formData.maxOrderValue === '') {
                newErrors.maxOrderValue = 'Maximum order value is required (or check "No Maximum Limit")';
            } else if (parseFloat(formData.maxOrderValue) < 0) {
                newErrors.maxOrderValue = 'Maximum order value cannot be negative';
            } else if (parseFloat(formData.maxOrderValue) <= parseFloat(formData.minOrderValue)) {
                newErrors.maxOrderValue = 'Maximum order value must be greater than minimum order value';
            }
        }

        // Shipping cost validation
        if (formData.shippingCost < 0) {
            newErrors.shippingCost = 'Shipping cost cannot be negative';
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
                minOrderValue: parseFloat(formData.minOrderValue),
                maxOrderValue: noMaxLimit ? Number.MAX_SAFE_INTEGER : parseFloat(formData.maxOrderValue),
                shippingCost: parseFloat(formData.shippingCost),
                country: formData.country.trim(),
                state: formData.state.trim() || null,
                postalCodes: formData.postalCodes,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/shipping-rules/${id}`, payload);
                toast.success('Shipping rule updated successfully');
            } else {
                await api.post('/admin/shipping-rules', payload);
                toast.success('Shipping rule created successfully');
            }

            navigate('/shipping-rules-list');
        } catch (error) {
            console.error('Error saving shipping rule:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save shipping rule';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingRule) {
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
                                        Rule Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Standard India Shipping"
                                    />
                                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Order Value Range */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:cash-multiple" className="me-2" />
                                    Order Value Range
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Minimum Order Value (₹) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.minOrderValue ? 'is-invalid' : ''}`}
                                            name="minOrderValue"
                                            value={formData.minOrderValue}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                        {errors.minOrderValue && (
                                            <div className="invalid-feedback">{errors.minOrderValue}</div>
                                        )}
                                        <small className="text-muted">Orders above this value will apply this rule</small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Maximum Order Value (₹) {!noMaxLimit && <span className="text-danger">*</span>}
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.maxOrderValue ? 'is-invalid' : ''}`}
                                            name="maxOrderValue"
                                            value={formData.maxOrderValue}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            disabled={noMaxLimit}
                                        />
                                        {errors.maxOrderValue && (
                                            <div className="invalid-feedback">{errors.maxOrderValue}</div>
                                        )}
                                        <div className="form-check mt-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="noMaxLimit"
                                                checked={noMaxLimit}
                                                onChange={handleNoMaxLimitChange}
                                            />
                                            <label className="form-check-label small" htmlFor="noMaxLimit">
                                                No Maximum Limit
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {formData.minOrderValue >= 0 && (formData.maxOrderValue || noMaxLimit) && (
                                    <div className="alert alert-info mt-3 mb-0">
                                        <Icon icon="mdi:information" className="me-2" />
                                        This rule applies to orders between ₹{formData.minOrderValue} and {
                                            noMaxLimit ? 'unlimited' : `₹${formData.maxOrderValue}`
                                        }
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Cost */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:truck-fast" className="me-2" />
                                    Shipping Cost
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Shipping Cost (₹) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.shippingCost ? 'is-invalid' : ''}`}
                                        name="shippingCost"
                                        value={formData.shippingCost}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.shippingCost && (
                                        <div className="invalid-feedback">{errors.shippingCost}</div>
                                    )}
                                    <small className="text-muted">Set to 0 for free shipping</small>
                                </div>

                                {formData.shippingCost == 0 && (
                                    <div className="alert alert-success mb-0">
                                        <Icon icon="mdi:gift" className="me-2" />
                                        <strong>Free Shipping</strong> - Customers won't be charged for delivery
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Region Information */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">
                                    <Icon icon="mdi:map-marker" className="me-2" />
                                    Region Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Country <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                placeholder="e.g., India"
                                            />
                                            {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">State (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Maharashtra"
                                            />
                                            <small className="text-muted">Leave empty for all states</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Postal Codes */}
                                <div className="mb-3">
                                    <label className="form-label">Postal Codes (Optional)</label>
                                    <div className="input-group mb-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={postalCodeInput}
                                            onChange={(e) => setPostalCodeInput(e.target.value)}
                                            placeholder="Enter postal code"
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddPostalCode();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={handleAddPostalCode}
                                        >
                                            <Icon icon="mdi:plus" className="me-1" />
                                            Add
                                        </button>
                                    </div>
                                    <small className="text-muted">Leave empty for all postal codes. Press Enter or click Add.</small>

                                    {formData.postalCodes.length > 0 && (
                                        <div className="mt-3">
                                            <div className="d-flex flex-wrap gap-2">
                                                {formData.postalCodes.map((code, index) => (
                                                    <span key={index} className="badge bg-primary d-flex align-items-center">
                                                        {code}
                                                        <button
                                                            type="button"
                                                            className="btn-close btn-close-white ms-2"
                                                            style={{ fontSize: '0.6rem' }}
                                                            onClick={() => handleRemovePostalCode(code)}
                                                        ></button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                    <div className="col-md-6">
                                        <div
                                            className={`card cursor-pointer ${formData.status ? 'border-success bg-success-subtle' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: true }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body text-center">
                                                <Icon
                                                    icon="mdi:check-circle"
                                                    width="32"
                                                    className={formData.status ? 'text-success' : 'text-muted'}
                                                />
                                                <h6 className="mt-2 mb-0">Active</h6>
                                                <small className="text-muted">Rule is active and will be applied</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div
                                            className={`card cursor-pointer ${!formData.status ? 'border-secondary bg-secondary-subtle' : 'border'}`}
                                            onClick={() => setFormData(prev => ({ ...prev, status: false }))}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="card-body text-center">
                                                <Icon
                                                    icon="mdi:close-circle"
                                                    width="32"
                                                    className={!formData.status ? 'text-secondary' : 'text-muted'}
                                                />
                                                <h6 className="mt-2 mb-0">Inactive</h6>
                                                <small className="text-muted">Rule is disabled</small>
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
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:content-save" className="me-2" />
                                        {isEditMode ? 'Update Shipping Rule' : 'Create Shipping Rule'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/shipping-rules-list')}
                                disabled={loading}
                            >
                                <Icon icon="mdi:close" className="me-2" />
                                Cancel
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Preview Card */}
                        <div className="card border-0 shadow-sm mb-3 sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:eye" className="me-2" />
                                    Rule Preview
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <small className="text-muted">Title:</small>
                                    <div className="fw-bold">{formData.title || 'Not set'}</div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted">Order Range:</small>
                                    <div className="fw-bold">
                                        ₹{formData.minOrderValue} - {noMaxLimit ? 'Unlimited' : `₹${formData.maxOrderValue || '0'}`}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted">Shipping Cost:</small>
                                    <div className={`fw-bold ${formData.shippingCost == 0 ? 'text-success' : 'text-primary'}`}>
                                        {formData.shippingCost == 0 ? 'FREE' : `₹${formData.shippingCost}`}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted">Region:</small>
                                    <div className="fw-bold">
                                        {formData.country || 'Not set'}
                                        {formData.state && `, ${formData.state}`}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <small className="text-muted">Postal Codes:</small>
                                    <div className="fw-bold">
                                        {formData.postalCodes.length > 0
                                            ? `${formData.postalCodes.length} code(s)`
                                            : 'All codes'}
                                    </div>
                                </div>
                                <div>
                                    <small className="text-muted">Status:</small>
                                    <div>
                                        <span className={`badge ${formData.status ? 'bg-success' : 'bg-secondary'}`}>
                                            {formData.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:lightbulb" className="me-2 text-warning" />
                                    Quick Tips
                                </h6>
                            </div>
                            <div className="card-body">
                                <ul className="small mb-0 ps-3">
                                    <li className="mb-2">Set shipping cost to 0 for free shipping</li>
                                    <li className="mb-2">Leave state and postal codes empty for wider coverage</li>
                                    <li className="mb-2">Create multiple rules for different regions</li>
                                    <li>Higher priority rules are matched first</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddEditShippingRuleLayer;
