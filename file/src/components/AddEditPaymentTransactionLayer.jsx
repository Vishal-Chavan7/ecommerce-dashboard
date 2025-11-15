import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditPaymentTransactionLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        orderId: '',
        userId: '',
        paymentMethod: 'razorpay',
        transactionId: '',
        amount: '',
        currency: 'INR',
        status: 'initiated',
        gatewayOrderId: '',
        refundReason: '',
        failureReason: '',
        responseData: {}
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    const paymentMethods = [
        { value: 'razorpay', label: 'Razorpay', icon: 'simple-icons:razorpay', color: '#0c2f8f' },
        { value: 'stripe', label: 'Stripe', icon: 'simple-icons:stripe', color: '#635bff' },
        { value: 'paypal', label: 'PayPal', icon: 'simple-icons:paypal', color: '#0070ba' },
        { value: 'paytm', label: 'Paytm', icon: 'cib:paytm', color: '#00b9f5' }
    ];

    const statusOptions = [
        { value: 'initiated', label: 'Initiated', color: 'secondary', icon: 'mdi:clock-outline' },
        { value: 'pending', label: 'Pending', color: 'warning', icon: 'mdi:timer-sand' },
        { value: 'success', label: 'Success', color: 'success', icon: 'mdi:check-circle' },
        { value: 'failed', label: 'Failed', color: 'danger', icon: 'mdi:close-circle' },
        { value: 'refund', label: 'Refund', color: 'info', icon: 'mdi:cash-refund' }
    ];

    const currencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        console.log('=== AddEditPaymentTransaction Mount ===');
        console.log('1. Token exists:', !!token);
        console.log('2. Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'NULL');
        console.log('3. User exists:', !!user);
        console.log('4. User data:', user ? JSON.parse(user) : 'NULL');
        console.log('5. Current URL:', window.location.href);
        console.log('6. Is Edit Mode:', isEditMode);

        if (!token) {
            console.error('❌ REDIRECT REASON: No authentication token found');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }

        console.log('7. ✅ Token found, proceeding to fetch data...');

        // Add a small delay to ensure component is fully mounted
        const timer = setTimeout(() => {
            console.log('8. Starting data fetch after delay...');

            // Fetch data with error handling
            const fetchData = async () => {
                try {
                    const ordersSuccess = await fetchOrders();
                    const usersSuccess = await fetchUsers();

                    console.log('9. ✅ Fetch results - Orders:', ordersSuccess, 'Users:', usersSuccess);

                    if (isEditMode) {
                        console.log('10. Fetching transaction for edit mode...');
                        await fetchTransaction();
                    }
                } catch (error) {
                    console.error('❌ Error in fetchData:', error);
                }
            };

            fetchData();
        }, 100); // 100ms delay

        return () => clearTimeout(timer);
    }, [id]);

    const fetchOrders = async () => {
        console.log('📦 fetchOrders: Starting...');
        try {
            console.log('📦 fetchOrders: Making API call to /orders');
            const response = await api.get('/orders');
            console.log('📦 fetchOrders: SUCCESS - Response:', response.data);
            console.log('📦 fetchOrders: Orders count:', response.data.data?.length || 0);
            setOrders(response.data.data || []);
            return true; // Success
        } catch (error) {
            console.error('❌ fetchOrders: FAILED');
            console.error('❌ fetchOrders: Error details:', error);
            console.error('❌ fetchOrders: Error message:', error.message);
            console.error('❌ fetchOrders: Error status:', error.status);

            // Don't show error toast if it's a 401 (axios interceptor will handle redirect)
            if (error.status !== 401) {
                toast.error('Failed to fetch orders. You can still enter order details manually.');
            }
            return false; // Failure
        }
    };

    const fetchUsers = async () => {
        console.log('👥 fetchUsers: Starting...');
        try {
            console.log('👥 fetchUsers: Making API call to /admin/users');
            const response = await api.get('/admin/users');
            console.log('👥 fetchUsers: SUCCESS - Response:', response.data);
            console.log('👥 fetchUsers: Users count:', response.data.users?.length || 0);
            setUsers(response.data.users || []);
            return true; // Success
        } catch (error) {
            console.error('❌ fetchUsers: FAILED');
            console.error('❌ fetchUsers: Error details:', error);
            console.error('❌ fetchUsers: Error message:', error.message);
            console.error('❌ fetchUsers: Error status:', error.status);

            // Don't show error toast if it's a 401 (axios interceptor will handle redirect)
            if (error.status !== 401) {
                toast.error('Failed to fetch users. You can still enter user details manually.');
            }
            return false; // Failure
        }
    };

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/payment-transactions/${id}`);
            const transaction = response.data.transaction;
            setFormData({
                orderId: transaction.orderId?._id || '',
                userId: transaction.userId?._id || '',
                paymentMethod: transaction.paymentMethod || 'razorpay',
                transactionId: transaction.transactionId || '',
                amount: transaction.amount || '',
                currency: transaction.currency || 'INR',
                status: transaction.status || 'initiated',
                gatewayOrderId: transaction.gatewayOrderId || '',
                refundReason: transaction.refundReason || '',
                failureReason: transaction.failureReason || '',
                responseData: transaction.responseData || {}
            });
        } catch (error) {
            console.error('Error fetching transaction:', error);
            toast.error('Failed to load transaction');
            navigate('/payment-transactions');
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

        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.orderId) {
            errors.orderId = 'Order is required';
        }

        if (!formData.userId) {
            errors.userId = 'User is required';
        }

        if (!formData.paymentMethod) {
            errors.paymentMethod = 'Payment method is required';
        }

        if (!formData.transactionId) {
            errors.transactionId = 'Transaction ID is required';
        }

        if (!formData.amount || formData.amount <= 0) {
            errors.amount = 'Valid amount is required';
        }

        if (!formData.currency) {
            errors.currency = 'Currency is required';
        }

        if (!formData.status) {
            errors.status = 'Status is required';
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

            if (isEditMode) {
                await api.put(`/admin/payment-transactions/${id}`, formData);
                toast.success('Transaction updated successfully');
            } else {
                await api.post('/admin/payment-transactions', formData);
                toast.success('Transaction created successfully');
            }

            navigate('/payment-transactions');
        } catch (error) {
            console.error('Error saving transaction:', error);
            toast.error(error.response?.data?.message || 'Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    const getPaymentMethodIcon = (method) => {
        const found = paymentMethods.find(m => m.value === method);
        return found ? found.icon : 'mdi:credit-card';
    };

    const getPaymentMethodColor = (method) => {
        const found = paymentMethods.find(m => m.value === method);
        return found ? found.color : '#6366f1';
    };

    const getStatusBadge = (status) => {
        const found = statusOptions.find(s => s.value === status);
        return found ? { color: found.color, icon: found.icon } : { color: 'secondary', icon: 'mdi:help' };
    };

    return (
        <div className='container-fluid'>
            {/* Header */}
            <div className='row mb-4'>
                <div className='col-12'>
                    <div className='d-flex align-items-center mb-3'>
                        <button
                            className='btn btn-link text-decoration-none me-3'
                            onClick={() => navigate('/payment-transactions')}
                        >
                            <Icon icon='mdi:arrow-left' style={{ fontSize: '24px' }} />
                        </button>
                        <div>
                            <h2 className='mb-1 d-flex align-items-center' style={{ fontSize: '28px' }}>
                                <Icon icon='mdi:credit-card-sync' className='me-2' style={{ fontSize: '32px' }} />
                                {isEditMode ? 'Edit Payment Transaction' : 'Add Payment Transaction'}
                            </h2>
                            <p className='text-muted mb-0' style={{ fontSize: '14px' }}>
                                {isEditMode ? 'Update payment transaction details' : 'Create a new payment transaction record'}
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
                                Transaction Details
                            </h5>
                        </div>
                        <div className='card-body'>
                            <form onSubmit={handleSubmit}>
                                {/* Order Selection */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:receipt' className='me-2' style={{ fontSize: '18px' }} />
                                        Order <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.orderId ? 'is-invalid' : ''}`}
                                        name='orderId'
                                        value={formData.orderId}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        <option value=''>Select order</option>
                                        {orders.map(order => (
                                            <option key={order._id} value={order._id}>
                                                {order.orderNumber} - ₹{order.totalAmount}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.orderId && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.orderId}</div>
                                    )}
                                </div>

                                {/* User Selection */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:account' className='me-2' style={{ fontSize: '18px' }} />
                                        User <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.userId ? 'is-invalid' : ''}`}
                                        name='userId'
                                        value={formData.userId}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        <option value=''>Select user</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.userId && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.userId}</div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:credit-card' className='me-2' style={{ fontSize: '18px' }} />
                                        Payment Method <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.paymentMethod ? 'is-invalid' : ''}`}
                                        name='paymentMethod'
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        <option value=''>Select payment method</option>
                                        {paymentMethods.map(method => (
                                            <option key={method.value} value={method.value}>
                                                {method.label}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.paymentMethod && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.paymentMethod}</div>
                                    )}
                                </div>

                                {/* Transaction ID */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:identifier' className='me-2' style={{ fontSize: '18px' }} />
                                        Transaction ID <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <input
                                        type='text'
                                        className={`form-control ${validationErrors.transactionId ? 'is-invalid' : ''}`}
                                        name='transactionId'
                                        value={formData.transactionId}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        placeholder='Enter transaction ID'
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    />
                                    {validationErrors.transactionId && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.transactionId}</div>
                                    )}
                                </div>

                                {/* Amount and Currency */}
                                <div className='row mb-4'>
                                    <div className='col-md-8'>
                                        <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                            <Icon icon='mdi:currency-inr' className='me-2' style={{ fontSize: '18px' }} />
                                            Amount <span className='text-danger ms-1'>*</span>
                                        </label>
                                        <input
                                            type='number'
                                            className={`form-control ${validationErrors.amount ? 'is-invalid' : ''}`}
                                            name='amount'
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            placeholder='Enter amount'
                                            step='0.01'
                                            min='0'
                                            style={{ fontSize: '14px', padding: '10px 12px' }}
                                        />
                                        {validationErrors.amount && (
                                            <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.amount}</div>
                                        )}
                                    </div>
                                    <div className='col-md-4'>
                                        <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                            <Icon icon='mdi:currency-usd' className='me-2' style={{ fontSize: '18px' }} />
                                            Currency <span className='text-danger ms-1'>*</span>
                                        </label>
                                        <select
                                            className={`form-select ${validationErrors.currency ? 'is-invalid' : ''}`}
                                            name='currency'
                                            value={formData.currency}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            style={{ fontSize: '14px', padding: '10px 12px' }}
                                        >
                                            {currencies.map(currency => (
                                                <option key={currency} value={currency}>
                                                    {currency}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.currency && (
                                            <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.currency}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:flag' className='me-2' style={{ fontSize: '18px' }} />
                                        Status <span className='text-danger ms-1'>*</span>
                                    </label>
                                    <select
                                        className={`form-select ${validationErrors.status ? 'is-invalid' : ''}`}
                                        name='status'
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        {statusOptions.map(status => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.status && (
                                        <div className='invalid-feedback' style={{ fontSize: '13px' }}>{validationErrors.status}</div>
                                    )}
                                </div>

                                {/* Gateway Order ID */}
                                <div className='mb-4'>
                                    <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                        <Icon icon='mdi:invoice-text' className='me-2' style={{ fontSize: '18px' }} />
                                        Gateway Order ID
                                    </label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        name='gatewayOrderId'
                                        value={formData.gatewayOrderId}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        placeholder='Enter gateway order ID'
                                        style={{ fontSize: '14px', padding: '10px 12px' }}
                                    />
                                </div>

                                {/* Conditional Fields */}
                                {formData.status === 'failed' && (
                                    <div className='mb-4'>
                                        <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                            <Icon icon='mdi:alert-circle' className='me-2' style={{ fontSize: '18px', color: '#ef4444' }} />
                                            Failure Reason
                                        </label>
                                        <textarea
                                            className='form-control'
                                            name='failureReason'
                                            value={formData.failureReason}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            placeholder='Enter failure reason'
                                            rows='3'
                                            style={{ fontSize: '14px', padding: '10px 12px' }}
                                        />
                                    </div>
                                )}

                                {formData.status === 'refund' && (
                                    <div className='mb-4'>
                                        <label className='form-label fw-semibold d-flex align-items-center' style={{ fontSize: '15px' }}>
                                            <Icon icon='mdi:cash-refund' className='me-2' style={{ fontSize: '18px', color: '#8b5cf6' }} />
                                            Refund Reason
                                        </label>
                                        <textarea
                                            className='form-control'
                                            name='refundReason'
                                            value={formData.refundReason}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                            placeholder='Enter refund reason'
                                            rows='3'
                                            style={{ fontSize: '14px', padding: '10px 12px' }}
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className='d-flex justify-content-end gap-3 mt-4'>
                                    <button
                                        type='button'
                                        className='btn btn-secondary d-flex align-items-center px-4 py-2'
                                        onClick={() => navigate('/payment-transactions')}
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
                                                {isEditMode ? 'Update Transaction' : 'Create Transaction'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Transaction Info */}
                <div className='col-lg-4'>
                    {/* Current Transaction Preview */}
                    {formData.amount && (
                        <div className='card shadow-sm mb-4'>
                            <div className='card-header' style={{ backgroundColor: getPaymentMethodColor(formData.paymentMethod), color: 'white' }}>
                                <h6 className='mb-0 d-flex align-items-center' style={{ fontSize: '16px' }}>
                                    <Icon icon={getPaymentMethodIcon(formData.paymentMethod)} className='me-2' style={{ fontSize: '20px' }} />
                                    Transaction Preview
                                </h6>
                            </div>
                            <div className='card-body'>
                                <div className='mb-3'>
                                    <small className='text-muted d-block mb-1' style={{ fontSize: '12px' }}>Amount</small>
                                    <h4 className='mb-0' style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        {formData.currency} {parseFloat(formData.amount || 0).toFixed(2)}
                                    </h4>
                                </div>
                                <div className='mb-3'>
                                    <small className='text-muted d-block mb-1' style={{ fontSize: '12px' }}>Status</small>
                                    <span className={`badge bg-${getStatusBadge(formData.status).color}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                        <Icon icon={getStatusBadge(formData.status).icon} className='me-1' />
                                        {statusOptions.find(s => s.value === formData.status)?.label}
                                    </span>
                                </div>
                                {formData.transactionId && (
                                    <div className='mb-2'>
                                        <small className='text-muted d-block mb-1' style={{ fontSize: '12px' }}>Transaction ID</small>
                                        <code className='d-block' style={{ fontSize: '12px', padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                                            {formData.transactionId}
                                        </code>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Guidelines */}
                    <div className='card shadow-sm'>
                        <div className='card-header bg-info text-white'>
                            <h6 className='mb-0 d-flex align-items-center' style={{ fontSize: '16px' }}>
                                <Icon icon='mdi:information' className='me-2' style={{ fontSize: '20px' }} />
                                Transaction Guidelines
                            </h6>
                        </div>
                        <div className='card-body'>
                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>Transaction ID</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Must be unique across all transactions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>Amount</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Should match the order total amount
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>Status</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Update status based on payment gateway response
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-3'>
                                <div className='d-flex align-items-start'>
                                    <Icon icon='mdi:check-circle' className='text-success me-2 mt-1' style={{ fontSize: '20px' }} />
                                    <div>
                                        <strong style={{ fontSize: '14px' }}>Gateway Order ID</strong>
                                        <p className='text-muted small mb-0' style={{ fontSize: '13px' }}>
                                            Reference ID from payment gateway
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className='alert alert-warning mb-0' style={{ fontSize: '13px' }}>
                                <Icon icon='mdi:shield-alert' className='me-2' />
                                <strong>Note:</strong> Ensure all details are accurate before submitting.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditPaymentTransactionLayer;
