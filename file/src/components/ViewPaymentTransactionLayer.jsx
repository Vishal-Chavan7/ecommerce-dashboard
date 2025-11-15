import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ViewPaymentTransactionLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundReason, setRefundReason] = useState('');

    useEffect(() => {
        fetchTransaction();
    }, [id]);

    const fetchTransaction = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/payment-transactions/${id}`);
            console.log('✅ Transaction details:', response.data);
            setTransaction(response.data.transaction);
        } catch (error) {
            console.error('❌ Error fetching transaction:', error);
            toast.error('Failed to load transaction details');
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async () => {
        if (!refundReason.trim()) {
            toast.error('Please enter a refund reason');
            return;
        }

        try {
            const response = await api.post(`/admin/payment-transactions/${id}/refund`, {
                refundReason
            });
            toast.success('Refund initiated successfully');
            setShowRefundModal(false);
            setRefundReason('');
            fetchTransaction();
        } catch (error) {
            console.error('❌ Error initiating refund:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate refund');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            initiated: '#6b7280',
            pending: '#f59e0b',
            success: '#10b981',
            failed: '#ef4444',
            refund: '#8b5cf6',
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            initiated: 'mdi:progress-clock',
            pending: 'mdi:timer-sand',
            success: 'mdi:check-circle',
            failed: 'mdi:close-circle',
            refund: 'mdi:cash-refund',
        };
        return icons[status] || 'mdi:help-circle';
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            razorpay: 'simple-icons:razorpay',
            stripe: 'simple-icons:stripe',
            paypal: 'simple-icons:paypal',
            paytm: 'simple-icons:paytm',
        };
        return icons[method] || 'mdi:credit-card';
    };

    const getPaymentMethodColor = (method) => {
        const colors = {
            razorpay: '#0c2f8c',
            stripe: '#635bff',
            paypal: '#00457c',
            paytm: '#00baf2',
        };
        return colors[method] || '#6b7280';
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className='container-fluid'>
                <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
                    <div className='spinner-border text-primary' role='status' style={{ width: '3rem', height: '3rem' }}>
                        <span className='visually-hidden'>Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card shadow-sm text-center' style={{ padding: '60px 20px' }}>
                            <div className='card-body'>
                                <Icon icon="mdi:alert-circle" style={{ fontSize: '64px', color: '#ef4444' }} />
                                <h3 className='mt-4 mb-2' style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                    Transaction Not Found
                                </h3>
                                <p className='text-muted mb-4' style={{ fontSize: '15px' }}>
                                    The transaction you're looking for doesn't exist or has been removed.
                                </p>
                                <button
                                    onClick={() => navigate('/payment-transactions')}
                                    className='btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2'
                                    style={{ fontSize: '15px' }}
                                >
                                    <Icon icon="mdi:arrow-left" style={{ fontSize: '18px' }} />
                                    Back to Transactions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container-fluid'>
            {/* Header */}
            <div className='row mb-4'>
                <div className='col-12'>
                    <div className='d-flex align-items-center justify-content-between mb-3'>
                        <div className='d-flex align-items-center'>
                            <button
                                className='btn btn-link text-decoration-none me-3'
                                onClick={() => navigate('/payment-transactions')}
                            >
                                <Icon icon='mdi:arrow-left' style={{ fontSize: '24px' }} />
                            </button>
                            <div>
                                <h2 className='mb-1 d-flex align-items-center' style={{ fontSize: '28px' }}>
                                    <Icon icon='mdi:credit-card-sync' className='me-2' style={{ fontSize: '32px' }} />
                                    Transaction Details
                                </h2>
                                <p className='text-muted mb-0 d-flex align-items-center gap-2' style={{ fontSize: '14px' }}>
                                    <Icon icon='mdi:identifier' style={{ fontSize: '16px' }} />
                                    <code className='px-2 py-1 bg-light rounded' style={{ fontSize: '13px' }}>
                                        {transaction.transactionId}
                                    </code>
                                </p>
                            </div>
                        </div>
                        <div className='d-flex align-items-center gap-3'>
                            {transaction.status === 'success' && !transaction.refundedAt && (
                                <button
                                    onClick={() => setShowRefundModal(true)}
                                    className='btn btn-danger d-flex align-items-center gap-2 px-4 py-2'
                                    style={{ fontSize: '15px' }}
                                >
                                    <Icon icon='mdi:cash-refund' style={{ fontSize: '18px' }} />
                                    Initiate Refund
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/edit-payment-transaction/${transaction._id}`)}
                                className='btn btn-primary d-flex align-items-center gap-2 px-4 py-2'
                                style={{ fontSize: '15px' }}
                            >
                                <Icon icon='mdi:pencil' style={{ fontSize: '18px' }} />
                                Edit Transaction
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='row'>
                {/* Main Content - Left Side */}
                <div className='col-lg-8'>
                    {/* Status & Amount Card */}
                    <div className='card shadow-sm mb-4'>
                        <div className='card-body' style={{ padding: '30px' }}>
                            <div className='d-flex align-items-center justify-content-between'>
                                <div className='d-flex align-items-center gap-4'>
                                    <div
                                        className='d-flex align-items-center justify-center rounded-3'
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            backgroundColor: `${getStatusColor(transaction.status)}20`,
                                        }}
                                    >
                                        <Icon
                                            icon={getStatusIcon(transaction.status)}
                                            style={{ fontSize: '40px', color: getStatusColor(transaction.status) }}
                                        />
                                    </div>
                                    <div>
                                        <p className='text-muted mb-1' style={{ fontSize: '13px', fontWeight: '500' }}>
                                            Transaction Status
                                        </p>
                                        <h3
                                            className='mb-0 text-capitalize'
                                            style={{ fontSize: '28px', fontWeight: 'bold', color: getStatusColor(transaction.status) }}
                                        >
                                            {transaction.status}
                                        </h3>
                                    </div>
                                </div>
                                <div className='text-end'>
                                    <p className='text-muted mb-1' style={{ fontSize: '13px', fontWeight: '500' }}>
                                        Amount
                                    </p>
                                    <h3 className='mb-0' style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                                        {formatCurrency(transaction.amount, transaction.currency)}
                                    </h3>
                                    <span className='badge bg-secondary mt-2' style={{ fontSize: '12px', padding: '4px 10px' }}>
                                        {transaction.currency}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className='card shadow-sm mb-4'>
                        <div className='card-header bg-white' style={{ padding: '20px 24px' }}>
                            <h5 className='mb-0 d-flex align-items-center' style={{ fontSize: '18px', fontWeight: '600' }}>
                                <Icon icon='mdi:credit-card-outline' className='me-2' style={{ fontSize: '24px' }} />
                                Payment Information
                            </h5>
                        </div>
                        <div className='card-body' style={{ padding: '24px' }}>
                            <div className='row g-4'>
                                <div className='col-md-6'>
                                    <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                        Payment Method
                                    </label>
                                    <div className='d-flex align-items-center gap-3 mt-2'>
                                        <div
                                            className='rounded-3 d-flex align-items-center justify-content-center'
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundColor: `${getPaymentMethodColor(transaction.paymentMethod)}15`,
                                            }}
                                        >
                                            <Icon
                                                icon={getPaymentMethodIcon(transaction.paymentMethod)}
                                                style={{
                                                    fontSize: '24px',
                                                    color: getPaymentMethodColor(transaction.paymentMethod),
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p className='mb-0 text-capitalize fw-bold' style={{ fontSize: '16px', color: '#1f2937' }}>
                                                {transaction.paymentMethod}
                                            </p>
                                            <p className='mb-0 text-muted' style={{ fontSize: '12px' }}>
                                                Gateway Payment
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                        Transaction ID
                                    </label>
                                    <div className='mt-2 d-flex align-items-center gap-2'>
                                        <code className='px-3 py-2 bg-light rounded-3 flex-grow-1' style={{ fontSize: '14px', fontWeight: '600' }}>
                                            {transaction.transactionId}
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(transaction.transactionId);
                                                toast.success('Transaction ID copied');
                                            }}
                                            className='btn btn-outline-secondary btn-sm'
                                            title='Copy'
                                        >
                                            <Icon icon='mdi:content-copy' style={{ fontSize: '16px' }} />
                                        </button>
                                    </div>
                                </div>
                                {transaction.gatewayOrderId && (
                                    <div className='col-md-6'>
                                        <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                            Gateway Order ID
                                        </label>
                                        <code className='d-block px-3 py-2 bg-light rounded-3 mt-2' style={{ fontSize: '14px', fontWeight: '600' }}>
                                            {transaction.gatewayOrderId}
                                        </code>
                                    </div>
                                )}
                                <div className='col-md-6'>
                                    <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                        Retry Count
                                    </label>
                                    <div className='mt-2'>
                                        <span className='badge bg-info' style={{ fontSize: '16px', padding: '8px 16px' }}>
                                            {transaction.retryCount || 0} Attempts
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Information */}
                    {transaction.orderId && (
                        <div className='card shadow-sm mb-4'>
                            <div className='card-header bg-white' style={{ padding: '20px 24px' }}>
                                <h5 className='mb-0 d-flex align-items-center' style={{ fontSize: '18px', fontWeight: '600' }}>
                                    <Icon icon='mdi:package-variant-closed' className='me-2' style={{ fontSize: '24px' }} />
                                    Order Information
                                </h5>
                            </div>
                            <div className='card-body' style={{ padding: '24px' }}>
                                <div className='row g-4'>
                                    <div className='col-md-6'>
                                        <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                            Order Number
                                        </label>
                                        <p className='mb-0 fw-bold' style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>
                                            {transaction.orderId.orderNumber || 'N/A'}
                                        </p>
                                    </div>
                                    <div className='col-md-6'>
                                        <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                            Order Status
                                        </label>
                                        <p className='mb-0 fw-bold text-capitalize' style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>
                                            {transaction.orderId.status || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Information */}
                    {transaction.userId && (
                        <div className='card shadow-sm mb-4'>
                            <div className='card-header bg-white' style={{ padding: '20px 24px' }}>
                                <h5 className='mb-0 d-flex align-items-center' style={{ fontSize: '18px', fontWeight: '600' }}>
                                    <Icon icon='mdi:account-circle' className='me-2' style={{ fontSize: '24px' }} />
                                    Customer Information
                                </h5>
                            </div>
                            <div className='card-body' style={{ padding: '24px' }}>
                                <div className='row g-4'>
                                    <div className='col-md-4'>
                                        <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                            Name
                                        </label>
                                        <p className='mb-0 fw-bold' style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>
                                            {transaction.userId.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div className='col-md-4'>
                                        <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                            Email
                                        </label>
                                        <p className='mb-0' style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>
                                            {transaction.userId.email || 'N/A'}
                                        </p>
                                    </div>
                                    {transaction.userId.phone && (
                                        <div className='col-md-4'>
                                            <label className='form-label text-muted fw-semibold' style={{ fontSize: '13px' }}>
                                                Phone
                                            </label>
                                            <p className='mb-0' style={{ fontSize: '16px', color: '#1f2937', marginTop: '8px' }}>
                                                {transaction.userId.phone}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Failure/Refund Details */}
                    {(transaction.failureReason || transaction.refundReason) && (
                        <div className='card shadow-sm mb-4'>
                            <div className='card-header bg-white' style={{ padding: '20px 24px' }}>
                                <h5 className='mb-0 d-flex align-items-center' style={{ fontSize: '18px', fontWeight: '600' }}>
                                    <Icon icon='mdi:information' className='me-2' style={{ fontSize: '24px' }} />
                                    Additional Information
                                </h5>
                            </div>
                            <div className='card-body' style={{ padding: '24px' }}>
                                {transaction.failureReason && (
                                    <div className='alert alert-danger mb-3' style={{ padding: '16px' }}>
                                        <div className='d-flex align-items-start gap-2'>
                                            <Icon icon='mdi:alert-circle' style={{ fontSize: '20px', marginTop: '2px' }} />
                                            <div>
                                                <p className='mb-1 fw-bold' style={{ fontSize: '14px' }}>Failure Reason</p>
                                                <p className='mb-0' style={{ fontSize: '14px' }}>{transaction.failureReason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {transaction.refundReason && (
                                    <div className='alert alert-info mb-0' style={{ padding: '16px', backgroundColor: '#f0f9ff', borderColor: '#bfdbfe' }}>
                                        <div className='d-flex align-items-start gap-2'>
                                            <Icon icon='mdi:cash-refund' style={{ fontSize: '20px', marginTop: '2px', color: '#0284c7' }} />
                                            <div>
                                                <p className='mb-1 fw-bold' style={{ fontSize: '14px', color: '#0284c7' }}>Refund Reason</p>
                                                <p className='mb-0' style={{ fontSize: '14px', color: '#0c4a6e' }}>{transaction.refundReason}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Gateway Response Data */}
                    {transaction.responseData && Object.keys(transaction.responseData).length > 0 && (
                        <div className='card shadow-sm mb-4'>
                            <div className='card-header bg-white' style={{ padding: '20px 24px' }}>
                                <h5 className='mb-0 d-flex align-items-center' style={{ fontSize: '18px', fontWeight: '600' }}>
                                    <Icon icon='mdi:code-json' className='me-2' style={{ fontSize: '24px' }} />
                                    Gateway Response Data
                                </h5>
                            </div>
                            <div className='card-body' style={{ padding: '24px' }}>
                                <div className='bg-light rounded-3 p-3' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <pre className='mb-0' style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                        {JSON.stringify(transaction.responseData, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Right Side */}
                <div className='col-lg-4'>
                    {/* Timeline */}
                    <div className='card shadow-sm mb-4'>
                        <div className='card-header bg-info text-white' style={{ padding: '20px 24px' }}>
                            <h6 className='mb-0 d-flex align-items-center' style={{ fontSize: '16px', fontWeight: '600' }}>
                                <Icon icon='mdi:timeline-clock' className='me-2' style={{ fontSize: '22px' }} />
                                Transaction Timeline
                            </h6>
                        </div>
                        <div className='card-body' style={{ padding: '24px' }}>
                            <div className='timeline'>
                                {/* Created */}
                                <div className='d-flex gap-3 mb-4 position-relative'>
                                    <div className='d-flex flex-column align-items-center' style={{ width: '40px' }}>
                                        <div
                                            className='rounded-circle d-flex align-items-center justify-content-center bg-primary'
                                            style={{ width: '40px', height: '40px', flexShrink: 0 }}
                                        >
                                            <Icon icon='mdi:plus-circle' style={{ fontSize: '20px', color: 'white' }} />
                                        </div>
                                        {transaction.updatedAt !== transaction.createdAt && (
                                            <div style={{ width: '2px', height: '60px', backgroundColor: '#e5e7eb', marginTop: '8px', marginBottom: '8px' }}></div>
                                        )}
                                    </div>
                                    <div className='flex-grow-1'>
                                        <p className='mb-1 fw-bold' style={{ fontSize: '14px', color: '#1f2937' }}>
                                            Transaction Created
                                        </p>
                                        <p className='mb-0 text-muted' style={{ fontSize: '12px' }}>
                                            {formatDate(transaction.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Updated */}
                                {transaction.updatedAt !== transaction.createdAt && (
                                    <div className='d-flex gap-3 mb-4 position-relative'>
                                        <div className='d-flex flex-column align-items-center' style={{ width: '40px' }}>
                                            <div
                                                className='rounded-circle d-flex align-items-center justify-content-center'
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    flexShrink: 0,
                                                    backgroundColor: `${getStatusColor(transaction.status)}20`,
                                                }}
                                            >
                                                <Icon
                                                    icon={getStatusIcon(transaction.status)}
                                                    style={{ fontSize: '20px', color: getStatusColor(transaction.status) }}
                                                />
                                            </div>
                                            {transaction.refundedAt && (
                                                <div style={{ width: '2px', height: '60px', backgroundColor: '#e5e7eb', marginTop: '8px', marginBottom: '8px' }}></div>
                                            )}
                                        </div>
                                        <div className='flex-grow-1'>
                                            <p className='mb-1 fw-bold text-capitalize' style={{ fontSize: '14px', color: '#1f2937' }}>
                                                Status: {transaction.status}
                                            </p>
                                            <p className='mb-0 text-muted' style={{ fontSize: '12px' }}>
                                                {formatDate(transaction.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Refunded */}
                                {transaction.refundedAt && (
                                    <div className='d-flex gap-3'>
                                        <div className='d-flex flex-column align-items-center' style={{ width: '40px' }}>
                                            <div
                                                className='rounded-circle d-flex align-items-center justify-content-center'
                                                style={{ width: '40px', height: '40px', flexShrink: 0, backgroundColor: '#f3e8ff' }}
                                            >
                                                <Icon icon='mdi:cash-refund' style={{ fontSize: '20px', color: '#8b5cf6' }} />
                                            </div>
                                        </div>
                                        <div className='flex-grow-1'>
                                            <p className='mb-1 fw-bold' style={{ fontSize: '14px', color: '#1f2937' }}>
                                                Refund Processed
                                            </p>
                                            <p className='mb-0 text-muted' style={{ fontSize: '12px' }}>
                                                {formatDate(transaction.refundedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className='card shadow-sm'>
                        <div className='card-header bg-white' style={{ padding: '20px 24px' }}>
                            <h6 className='mb-0 fw-bold' style={{ fontSize: '16px' }}>Quick Information</h6>
                        </div>
                        <div className='card-body' style={{ padding: '20px 24px' }}>
                            <div className='d-flex justify-content-between align-items-center py-3 border-bottom'>
                                <span className='text-muted' style={{ fontSize: '14px' }}>Internal ID</span>
                                <code className='px-2 py-1 bg-light rounded' style={{ fontSize: '12px', fontWeight: '600' }}>
                                    #{transaction._id.slice(-8).toUpperCase()}
                                </code>
                            </div>
                            <div className='d-flex justify-content-between align-items-center py-3 border-bottom'>
                                <span className='text-muted' style={{ fontSize: '14px' }}>Currency</span>
                                <span className='badge bg-secondary' style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    {transaction.currency}
                                </span>
                            </div>
                            <div className='d-flex justify-content-between align-items-center py-3 border-bottom'>
                                <span className='text-muted' style={{ fontSize: '14px' }}>Retry Attempts</span>
                                <span className='badge bg-info' style={{ fontSize: '13px', padding: '6px 12px' }}>
                                    {transaction.retryCount || 0}
                                </span>
                            </div>
                            <div className='d-flex justify-content-between align-items-center py-3'>
                                <span className='text-muted' style={{ fontSize: '14px' }}>Can Refund</span>
                                <span
                                    className={`badge ${transaction.status === 'success' && !transaction.refundedAt ? 'bg-success' : 'bg-danger'}`}
                                    style={{ fontSize: '13px', padding: '6px 12px' }}
                                >
                                    {transaction.status === 'success' && !transaction.refundedAt ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refund Modal */}
            {
                showRefundModal && (
                    <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className='modal-dialog modal-dialog-centered'>
                            <div className='modal-content shadow-lg'>
                                <div className='modal-header border-0' style={{ padding: '24px 24px 0' }}>
                                    <h5 className='modal-title d-flex align-items-center gap-2' style={{ fontSize: '20px', fontWeight: '600' }}>
                                        <Icon icon='mdi:cash-refund' style={{ fontSize: '26px', color: '#8b5cf6' }} />
                                        Initiate Refund
                                    </h5>
                                    <button
                                        type='button'
                                        className='btn-close'
                                        onClick={() => {
                                            setShowRefundModal(false);
                                            setRefundReason('');
                                        }}
                                    ></button>
                                </div>
                                <div className='modal-body' style={{ padding: '24px' }}>
                                    <div className='alert alert-warning' style={{ fontSize: '14px' }}>
                                        <Icon icon='mdi:alert' className='me-2' />
                                        <strong>Warning:</strong> This action will initiate a refund for this transaction. Please provide a reason.
                                    </div>
                                    <div className='mb-3'>
                                        <label className='form-label fw-semibold' style={{ fontSize: '14px' }}>
                                            Refund Reason <span className='text-danger'>*</span>
                                        </label>
                                        <textarea
                                            className='form-control'
                                            rows='4'
                                            value={refundReason}
                                            onChange={(e) => setRefundReason(e.target.value)}
                                            placeholder='Enter reason for refund...'
                                            style={{ fontSize: '14px' }}
                                        />
                                    </div>
                                    <div className='bg-light rounded-3 p-3'>
                                        <div className='d-flex justify-content-between mb-2'>
                                            <span className='text-muted' style={{ fontSize: '13px' }}>Transaction Amount:</span>
                                            <span className='fw-bold' style={{ fontSize: '13px' }}>
                                                {formatCurrency(transaction.amount, transaction.currency)}
                                            </span>
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            <span className='text-muted' style={{ fontSize: '13px' }}>Transaction ID:</span>
                                            <code style={{ fontSize: '12px' }}>{transaction.transactionId}</code>
                                        </div>
                                    </div>
                                </div>
                                <div className='modal-footer border-0' style={{ padding: '0 24px 24px' }}>
                                    <button
                                        type='button'
                                        className='btn btn-secondary d-flex align-items-center gap-2 px-4'
                                        onClick={() => {
                                            setShowRefundModal(false);
                                            setRefundReason('');
                                        }}
                                        style={{ fontSize: '14px' }}
                                    >
                                        <Icon icon='mdi:close' style={{ fontSize: '16px' }} />
                                        Cancel
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-danger d-flex align-items-center gap-2 px-4'
                                        onClick={handleRefund}
                                        disabled={!refundReason.trim()}
                                        style={{ fontSize: '14px' }}
                                    >
                                        <Icon icon='mdi:cash-refund' style={{ fontSize: '16px' }} />
                                        Confirm Refund
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ViewPaymentTransactionLayer;
