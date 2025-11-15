import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditPaymentMethodLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: true,
        config: {}
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Config fields based on payment method type
    const [configFields, setConfigFields] = useState({});

    const paymentMethods = ['COD', 'Razorpay', 'Stripe', 'PayPal'];
    const paymentTypes = ['Cash', 'Online', 'Gateway'];

    // Define config fields for each payment method
    const configFieldsMap = {
        'COD': {},
        'Razorpay': {
            keyId: { label: 'Key ID', type: 'text', required: true },
            keySecret: { label: 'Key Secret', type: 'password', required: true }
        },
        'Stripe': {
            publishableKey: { label: 'Publishable Key', type: 'text', required: true },
            secretKey: { label: 'Secret Key', type: 'password', required: true }
        },
        'PayPal': {
            clientId: { label: 'Client ID', type: 'text', required: true },
            clientSecret: { label: 'Client Secret', type: 'password', required: true },
            mode: { label: 'Mode', type: 'select', options: ['sandbox', 'live'], required: true }
        }
    };

    useEffect(() => {
        if (isEditMode) {
            fetchPaymentMethod();
        }
    }, [id]);

    useEffect(() => {
        if (formData.name) {
            setConfigFields(configFieldsMap[formData.name] || {});
        }
    }, [formData.name]);

    const fetchPaymentMethod = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/payment-methods/${id}`);
            const method = response.data.data;
            setFormData({
                name: method.name || '',
                type: method.type || '',
                status: method.status !== undefined ? method.status : true,
                config: method.config || {}
            });
        } catch (error) {
            console.error('Error fetching payment method:', error);
            toast.error('Failed to load payment method');
            navigate('/payment-methods');
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

    const handleConfigChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                [field]: value
            }
        }));

        if (validationErrors[`config.${field}`]) {
            setValidationErrors(prev => ({
                ...prev,
                [`config.${field}`]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.name) {
            errors.name = 'Payment method name is required';
        }

        if (!formData.type) {
            errors.type = 'Payment type is required';
        }

        // Validate config fields
        Object.keys(configFields).forEach(field => {
            if (configFields[field].required && !formData.config[field]) {
                errors[`config.${field}`] = `${configFields[field].label} is required`;
            }
        });

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

            if (isEditMode) {
                await api.put(`/admin/payment-methods/${id}`, formData);
                toast.success('Payment method updated successfully');
            } else {
                await api.post('/admin/payment-methods', formData);
                toast.success('Payment method created successfully');
            }

            navigate('/payment-methods');
        } catch (error) {
            console.error('Error saving payment method:', error);
            toast.error(error.response?.data?.message || 'Failed to save payment method');
        } finally {
            setLoading(false);
        }
    };

    const getMethodIcon = (name) => {
        const icons = {
            'COD': 'mdi:cash',
            'Razorpay': 'simple-icons:razorpay',
            'Stripe': 'simple-icons:stripe',
            'PayPal': 'simple-icons:paypal'
        };
        return icons[name] || 'mdi:credit-card';
    };

    return (
        <div className='container-fluid'>
            {/* Header */}
            <div className='row mb-4'>
                <div className='col-12'>
                    <div className='d-flex align-items-center mb-3'>
                        <button
                            className='btn btn-link text-decoration-none me-3'
                            onClick={() => navigate('/payment-methods')}
                        >
                            <Icon icon='mdi:arrow-left' style={{ fontSize: '24px' }} />
                        </button>
                        <div>
                            <h2 className='mb-1 d-flex align-items-center' style={{ fontSize: '28px' }}>
                                <Icon icon='mdi:credit-card-settings' className='me-2' style={{ fontSize: '32px' }} />
                                {isEditMode ? 'Edit Payment Method' : 'Add Payment Method'}
                            </h2>
                            <p className='text-muted mb-0' style={{ fontSize: '14px' }}>
                                {isEditMode ? 'Update payment method configuration' : 'Configure a new payment method for your store'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                <div className='col-lg-8'>
                    <div className='card shadow-sm'>
                        <div className='card-header bg-white'>
                            <h5 className='mb-0 d-flex align-items-center' style={{ fontSize: '18px' }}>
                                <Icon icon='mdi:form-textbox' className='me-2' style={{ fontSize: '22px' }} />
                                Payment Method Details
                            </h5>
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit}>
                                {/* Payment Method Name */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:credit-card' className='me-2' style={{ fontSize: '18px' }} />
                                        Payment Method <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.name ? 'is-invalid' : ''}`}
                                        name='name'
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={loading || isEditMode}
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        <option value=''>Select payment method</option>
                                        {paymentMethods.map(method => (
                                            <option key={method} value={method}>
                                                {method}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.name && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.name}</div>
                                    )}
                                    {isEditMode && (
                                        <small className='text-muted d-block mt-2' style={{ fontSize: '13px' }}>
                                            Payment method cannot be changed after creation
                                        </small>
                                    )}
                                </div>

                                {/* Payment Type */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:tag' className='me-2' style={{ fontSize: '18px' }} />
                                        Payment Type <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.type ? 'is-invalid' : ''}`}
                                        name='type'
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        <option value=''>Select payment type</option>
                                        {paymentTypes.map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.type && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.type}</div>
                                    )}
                                </div>

                                {/* Configuration Fields */}
                                {formData.name && Object.keys(configFields).length > 0 && (
                                    <div className='mb-4'>
                                        <h6 className='fw-semibold mb-3 d-flex align-items-center' style={{ fontSize: '16px' }}>
                                            <Icon icon='mdi:cog' className='me-2' style={{ fontSize: '20px' }} />
                                            Gateway Configuration
                                        </h6>
                                        {Object.keys(configFields).map(field => (
                                            <div key={field} className='mb-3'>
                                                <label className='form-label fw-semibold' style={{ fontSize: '14px' }}>
                                                    {configFields[field].label}
                                                    {configFields[field].required && <span className='text-danger ms-1'>*</span>}
                                                </label>
                                                {configFields[field].type === 'select' ? (
                                                    <select
                                                        className={`form-select ${validationErrors[`config.${field}`] ? 'is-invalid' : ''}`}
                                                        value={formData.config[field] || ''}
                                                        onChange={(e) => handleConfigChange(field, e.target.value)}
                                                        disabled={loading}
                                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                                    >
                                                        <option value=''>Select {configFields[field].label}</option>
                                                        {configFields[field].options.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={configFields[field].type}
                                                        className={`form-control ${validationErrors[`config.${field}`] ? 'is-invalid' : ''}`}
                                                        value={formData.config[field] || ''}
                                                        onChange={(e) => handleConfigChange(field, e.target.value)}
                                                        disabled={loading}
                                                        placeholder={`Enter ${configFields[field].label}`}
                                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                                    />
                                                )}
                                                {validationErrors[`config.${field}`] && (
                                                    <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors[`config.${field}`]}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Status */}
                                <div className='mb-4'>
                                    <div className='card bg-light' style={{ border: '1px solid #e5e7eb' }}>
                                        <div className='card-body'>
                                            <div className='d-flex align-items-center justify-content-between'>
                                                <div>
                                                    <h6 className='mb-1 d-flex align-items-center' style={{ fontSize: '15px' }}>
                                                        <Icon icon='mdi:power' className='me-2' style={{ fontSize: '20px' }} />
                                                        Payment Method Status
                                                    </h6>
                                                    <p className='text-muted mb-0' style={{ fontSize: '13px' }}>
                                                        Enable or disable this payment method
                                                    </p>
                                                </div>
                                                <div className='d-flex align-items-center gap-3'>
                                                    <span className={`badge ${formData.status ? 'bg-success-600' : 'bg-secondary-400'}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                                        {formData.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className='form-check form-switch'>
                                                        <input
                                                            className='form-check-input'
                                                            type='checkbox'
                                                            role='switch'
                                                            name='status'
                                                            checked={formData.status}
                                                            onChange={handleInputChange}
                                                            style={{ width: '48px', height: '24px', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className='d-flex justify-content-end gap-3 mt-4'>
                                    <button
                                        type='button'
                                        className='btn btn-secondary d-flex align-items-center px-4 py-2'
                                        onClick={() => navigate('/payment-methods')}
                                        disabled={loading}
                                        style={{ fontSize: '15px' }}
                                    >
                                        <Icon icon='mdi:close' className='me-2' style={{ fontSize: '18px' }} />
                                        Cancel
                                    </button>
                                    <button
                                        type='submit'
                                        className='btn btn-primary d-flex align-items-center px-4 py-2'
                                        disabled={loading}
                                        style={{ fontSize: '15px' }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className='spinner-border spinner-border-sm me-2' />
                                                {isEditMode ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon='mdi:content-save' className='me-2' style={{ fontSize: '18px' }} />
                                                {isEditMode ? 'Update Payment Method' : 'Create Payment Method'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Guidelines */}
                <div className='col-lg-4'>
                    <div className='card shadow-sm'>
                        <div className='card-header bg-info text-white'>
                            <h6 className='mb-0 d-flex align-items-center' style={{ fontSize: '16px' }}>
                                <Icon icon='mdi:information' className='me-2' style={{ fontSize: '20px' }} />
                                Payment Method Guidelines
                            </h6>
                        </div>
                        <div className='card-body'>
                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>COD (Cash on Delivery)</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            No configuration needed. Enable for offline payments.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>Razorpay</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Get your API keys from Razorpay dashboard
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>Stripe</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Get publishable and secret keys from Stripe
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>PayPal</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Configure client credentials and select mode
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className='alert alert-warning mb-0' style={{ fontSize: '13px' }}>
                                <Icon icon='mdi:shield-alert' className='me-2' />
                                <strong>Security:</strong> Never share your API keys publicly. Store them securely.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditPaymentMethodLayer;
