import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditTaxRuleLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        type: 'percentage',
        value: '',
        country: 'IN',
        state: '',
        status: true
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Common countries with tax systems
    const countries = [
        { code: 'IN', name: 'India (GST)' },
        { code: 'US', name: 'United States (Sales Tax)' },
        { code: 'AE', name: 'UAE (VAT)' },
        { code: 'GB', name: 'United Kingdom (VAT)' },
        { code: 'CA', name: 'Canada (GST/HST)' },
        { code: 'AU', name: 'Australia (GST)' },
        { code: 'SG', name: 'Singapore (GST)' },
        { code: 'EU', name: 'European Union (VAT)' },
        { code: 'OTHER', name: 'Other' }
    ];

    // Indian states for GST
    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];

    // US states for sales tax
    const usStates = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
        'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
        'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
        'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
        'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
        'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
        'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
        'West Virginia', 'Wisconsin', 'Wyoming'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchTaxRuleData();
        }
    }, [id]);

    const fetchTaxRuleData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/tax-rules/${id}`);
            const taxRule = response.data;

            setFormData({
                name: taxRule.name || '',
                type: taxRule.type || 'percentage',
                value: taxRule.value || '',
                country: taxRule.country || 'IN',
                state: taxRule.state || '',
                status: taxRule.status !== undefined ? taxRule.status : true
            });
        } catch (error) {
            console.error('Error fetching tax rule:', error);
            toast.error('Failed to load tax rule data');
            navigate('/tax-rules-list');
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

        // Clear state when country changes
        if (name === 'country') {
            setFormData(prev => ({
                ...prev,
                state: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name || formData.name.trim() === '') {
            errors.name = 'Tax rule name is required';
        }

        if (!formData.type) {
            errors.type = 'Tax type is required';
        }

        if (!formData.value || formData.value === '') {
            errors.value = 'Tax value is required';
        } else {
            const value = parseFloat(formData.value);
            if (isNaN(value) || value < 0) {
                errors.value = 'Tax value must be a positive number';
            }
            if (formData.type === 'percentage' && value > 100) {
                errors.value = 'Percentage cannot exceed 100%';
            }
        }

        if (!formData.country || formData.country.trim() === '') {
            errors.country = 'Country is required';
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
                name: formData.name.trim(),
                type: formData.type,
                value: parseFloat(formData.value),
                country: formData.country,
                state: formData.state.trim() || null,
                status: formData.status
            };

            if (isEditMode) {
                await api.put(`/admin/tax-rules/${id}`, submitData);
                toast.success('Tax rule updated successfully');
            } else {
                await api.post('/admin/tax-rules', submitData);
                toast.success('Tax rule created successfully');
            }

            navigate('/tax-rules-list');
        } catch (error) {
            console.error('Error saving tax rule:', error);
            toast.error(error.response?.data?.message || 'Failed to save tax rule');
        } finally {
            setLoading(false);
        }
    };

    const getStatesList = () => {
        if (formData.country === 'IN') return indianStates;
        if (formData.country === 'US') return usStates;
        return [];
    };

    const getPreviewText = () => {
        if (!formData.value) return null;
        const value = parseFloat(formData.value);
        if (isNaN(value)) return null;

        if (formData.type === 'percentage') {
            return `${value}% will be added to product price`;
        } else {
            return `₹${value.toFixed(2)} will be added to product price`;
        }
    };

    const getExampleCalculation = () => {
        if (!formData.value) return null;
        const value = parseFloat(formData.value);
        if (isNaN(value)) return null;

        const productPrice = 1000;
        let taxAmount = 0;
        let finalPrice = 0;

        if (formData.type === 'percentage') {
            taxAmount = (productPrice * value) / 100;
            finalPrice = productPrice + taxAmount;
        } else {
            taxAmount = value;
            finalPrice = productPrice + taxAmount;
        }

        return {
            productPrice,
            taxAmount: taxAmount.toFixed(2),
            finalPrice: finalPrice.toFixed(2)
        };
    };

    const example = getExampleCalculation();

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
                        {isEditMode ? 'Edit Tax Rule' : 'Add New Tax Rule'}
                    </h4>
                    <p className="text-muted mb-0">
                        {isEditMode ? 'Update tax rule information' : 'Create a new tax rule for products'}
                    </p>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/tax-rules-list')}
                >
                    <Icon icon="mdi:arrow-left" className="me-1" />
                    Back to List
                </button>
            </div>

            <div className="row">
                {/* Form Section */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* Tax Rule Name */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:label" className="me-1" />
                                        Tax Rule Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                                        name="name"
                                        placeholder="e.g., GST 18%, VAT 5%, Sales Tax CA"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    />
                                    {validationErrors.name && (
                                        <div className="invalid-feedback">{validationErrors.name}</div>
                                    )}
                                    <small className="text-muted">
                                        Choose a descriptive name for easy identification
                                    </small>
                                </div>

                                {/* Tax Type */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:format-list-bulleted-type" className="me-1" />
                                        Tax Type <span className="text-danger">*</span>
                                    </label>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className={`form-check card p-3 ${formData.type === 'percentage' ? 'border-primary bg-light' : ''}`}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="type"
                                                    id="typePercentage"
                                                    value="percentage"
                                                    checked={formData.type === 'percentage'}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label ms-2" htmlFor="typePercentage">
                                                    <div className="d-flex align-items-center">
                                                        <Icon icon="mdi:percent" width="24" className="text-info me-2" />
                                                        <div>
                                                            <strong>Percentage</strong>
                                                            <small className="d-block text-muted">
                                                                Tax as % of product price (e.g., 18%)
                                                            </small>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className={`form-check card p-3 ${formData.type === 'fixed' ? 'border-primary bg-light' : ''}`}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="type"
                                                    id="typeFixed"
                                                    value="fixed"
                                                    checked={formData.type === 'fixed'}
                                                    onChange={handleInputChange}
                                                    disabled={loading}
                                                />
                                                <label className="form-check-label ms-2" htmlFor="typeFixed">
                                                    <div className="d-flex align-items-center">
                                                        <Icon icon="mdi:currency-inr" width="24" className="text-warning me-2" />
                                                        <div>
                                                            <strong>Fixed Amount</strong>
                                                            <small className="d-block text-muted">
                                                                Fixed tax amount (e.g., ₹50)
                                                            </small>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    {validationErrors.type && (
                                        <div className="text-danger small mt-2">{validationErrors.type}</div>
                                    )}
                                </div>

                                {/* Tax Value */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon={formData.type === 'percentage' ? 'mdi:percent' : 'mdi:currency-inr'} className="me-1" />
                                        Tax Value <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        {formData.type === 'fixed' && (
                                            <span className="input-group-text">₹</span>
                                        )}
                                        <input
                                            type="number"
                                            className={`form-control ${validationErrors.value ? 'is-invalid' : ''}`}
                                            name="value"
                                            placeholder={formData.type === 'percentage' ? '18' : '100'}
                                            value={formData.value}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            step={formData.type === 'percentage' ? '0.01' : '0.01'}
                                            min="0"
                                            max={formData.type === 'percentage' ? '100' : undefined}
                                        />
                                        {formData.type === 'percentage' && (
                                            <span className="input-group-text">%</span>
                                        )}
                                        {validationErrors.value && (
                                            <div className="invalid-feedback">{validationErrors.value}</div>
                                        )}
                                    </div>
                                    {getPreviewText() && (
                                        <small className="text-success">
                                            <Icon icon="mdi:check-circle" className="me-1" />
                                            {getPreviewText()}
                                        </small>
                                    )}
                                </div>

                                {/* Country */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        <Icon icon="mdi:earth" className="me-1" />
                                        Country <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.country ? 'is-invalid' : ''}`}
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        {countries.map(country => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.country && (
                                        <div className="invalid-feedback">{validationErrors.country}</div>
                                    )}
                                    <small className="text-muted">
                                        Select the country where this tax rule applies
                                    </small>
                                </div>

                                {/* State (Optional) */}
                                {(formData.country === 'IN' || formData.country === 'US') && (
                                    <div className="mb-4">
                                        <label className="form-label">
                                            <Icon icon="mdi:map-marker" className="me-1" />
                                            State/Region (Optional)
                                        </label>
                                        <select
                                            className="form-select"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            <option value="">All States (National)</option>
                                            {getStatesList().map(state => (
                                                <option key={state} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-muted">
                                            Leave empty for national tax, or select specific state/region
                                        </small>
                                    </div>
                                )}

                                {/* Status */}
                                <div className="mb-4">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="status"
                                            id="status"
                                            checked={formData.status}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <label className="form-check-label" htmlFor="status">
                                            <Icon icon={formData.status ? 'mdi:check-circle' : 'mdi:close-circle'} className="me-1" />
                                            {formData.status ? 'Active' : 'Inactive'}
                                        </label>
                                    </div>
                                    <small className="text-muted">
                                        Only active tax rules can be applied to products
                                    </small>
                                </div>

                                {/* Form Actions */}
                                <div className="d-flex gap-2">
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
                                                {isEditMode ? 'Update Tax Rule' : 'Create Tax Rule'}
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/tax-rules-list')}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Example Calculation */}
                    {example && (
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-body">
                                <h6 className="card-title">
                                    <Icon icon="mdi:calculator" className="me-2" />
                                    Example Calculation
                                </h6>
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Product Price:</span>
                                        <span className="fw-medium">₹{example.productPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tax Amount:</span>
                                        <span className="text-danger fw-medium">+ ₹{example.taxAmount}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold">Final Price:</span>
                                        <span className="fw-bold text-success">₹{example.finalPrice}</span>
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
                                <li className="mb-2">Use descriptive names like "GST 18%" or "VAT 5%"</li>
                                <li className="mb-2">Percentage tax is calculated based on product price</li>
                                <li className="mb-2">Fixed tax adds a constant amount regardless of price</li>
                                <li className="mb-2">State-specific rules override national rules</li>
                                <li>Inactive rules won't be available for product assignment</li>
                            </ul>
                        </div>
                    </div>

                    {/* Common Tax Examples */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-title">
                                <Icon icon="mdi:book-open-variant" className="me-2 text-info" />
                                Common Tax Examples
                            </h6>
                            <div className="small">
                                <div className="mb-3">
                                    <strong>India (GST):</strong>
                                    <ul className="mb-0 ps-3">
                                        <li>5%, 12%, 18%, 28%</li>
                                        <li>CGST + SGST for intra-state</li>
                                        <li>IGST for inter-state</li>
                                    </ul>
                                </div>
                                <div className="mb-3">
                                    <strong>UAE (VAT):</strong>
                                    <ul className="mb-0 ps-3">
                                        <li>Standard rate: 5%</li>
                                        <li>Zero-rated goods: 0%</li>
                                    </ul>
                                </div>
                                <div className="mb-0">
                                    <strong>USA (Sales Tax):</strong>
                                    <ul className="mb-0 ps-3">
                                        <li>Varies by state (0-10%)</li>
                                        <li>Can include county/city tax</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditTaxRuleLayer;
