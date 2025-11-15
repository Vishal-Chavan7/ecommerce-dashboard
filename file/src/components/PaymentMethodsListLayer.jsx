import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const PaymentMethodsListLayer = () => {
    const navigate = useNavigate();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            console.log('=== PAYMENT METHODS DEBUG ===');
            console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
            console.log('User:', localStorage.getItem('user'));

            const response = await api.get('/admin/payment-methods');
            console.log('Response:', response);
            setPaymentMethods(response.data.data || []);
        } catch (error) {
            console.error('=== ERROR FETCHING PAYMENT METHODS ===');
            console.error('Error:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            toast.error('Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/payment-methods/${id}`, { status: !currentStatus });
            toast.success('Status updated successfully');
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/payment-methods/${deleteId}`);
            toast.success('Payment method deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error deleting payment method:', error);
            toast.error('Failed to delete payment method');
        }
    };

    const filteredMethods = paymentMethods.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMethodIcon = (name) => {
        const icons = {
            'COD': 'mdi:cash',
            'Razorpay': 'simple-icons:razorpay',
            'Stripe': 'simple-icons:stripe',
            'PayPal': 'simple-icons:paypal'
        };
        return icons[name] || 'mdi:credit-card';
    };

    const getMethodColor = (name) => {
        const colors = {
            'COD': '#10b981',
            'Razorpay': '#0c2f8c',
            'Stripe': '#635bff',
            'PayPal': '#00457c'
        };
        return colors[name] || '#6366f1';
    };

    if (loading) {
        return (
            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
                <div className='spinner-border text-primary-600' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header Section */}
            <div className='row mb-4'>
                <div className='col-12'>
                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                        <div>
                            <h4 className='mb-1 d-flex align-items-center' style={{ fontSize: '24px', fontWeight: '600' }}>
                                <Icon icon='mdi:credit-card-multiple' className='me-2' style={{ fontSize: '28px', color: '#6366f1' }} />
                                Payment Methods
                            </h4>
                            <p className='text-muted mb-0' style={{ fontSize: '15px' }}>
                                Manage payment gateways and methods for your store
                            </p>
                        </div>
                        <button
                            className='btn btn-primary-600 d-flex align-items-center gap-2'
                            onClick={() => navigate('/add-payment-method')}
                            style={{ fontSize: '16px', padding: '12px 24px', fontWeight: '500' }}
                        >
                            <Icon icon='ph:plus-bold' style={{ fontSize: '20px' }} />
                            Add Payment Method
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className='row g-3 mb-4'>
                <div className='col-sm-6 col-lg-3'>
                    <div className='card shadow-sm border-0'>
                        <div className='card-body'>
                            <div className='d-flex align-items-center'>
                                <div className='flex-shrink-0' style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '12px',
                                    backgroundColor: '#6366f115',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon icon='mdi:credit-card-multiple' style={{ fontSize: '28px', color: '#6366f1' }} />
                                </div>
                                <div className='flex-grow-1 ms-3'>
                                    <p className='text-muted mb-1' style={{ fontSize: '14px' }}>Total Methods</p>
                                    <h5 className='mb-0' style={{ fontSize: '20px', fontWeight: '600' }}>{paymentMethods.length}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-sm-6 col-lg-3'>
                    <div className='card shadow-sm border-0'>
                        <div className='card-body'>
                            <div className='d-flex align-items-center'>
                                <div className='flex-shrink-0' style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '12px',
                                    backgroundColor: '#10b98115',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon icon='mdi:check-circle' style={{ fontSize: '28px', color: '#10b981' }} />
                                </div>
                                <div className='flex-grow-1 ms-3'>
                                    <p className='text-muted mb-1' style={{ fontSize: '14px' }}>Active</p>
                                    <h5 className='mb-0' style={{ fontSize: '20px', fontWeight: '600' }}>
                                        {paymentMethods.filter(m => m.status).length}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-sm-6 col-lg-3'>
                    <div className='card shadow-sm border-0'>
                        <div className='card-body'>
                            <div className='d-flex align-items-center'>
                                <div className='flex-shrink-0' style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f59e0b15',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon icon='mdi:cog-outline' style={{ fontSize: '28px', color: '#f59e0b' }} />
                                </div>
                                <div className='flex-grow-1 ms-3'>
                                    <p className='text-muted mb-1' style={{ fontSize: '14px' }}>Configured</p>
                                    <h5 className='mb-0' style={{ fontSize: '20px', fontWeight: '600' }}>
                                        {paymentMethods.filter(m => Object.keys(m.config || {}).length > 0).length}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-sm-6 col-lg-3'>
                    <div className='card shadow-sm border-0'>
                        <div className='card-body'>
                            <div className='d-flex align-items-center'>
                                <div className='flex-shrink-0' style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '12px',
                                    backgroundColor: '#ef444415',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon icon='mdi:close-circle' style={{ fontSize: '28px', color: '#ef4444' }} />
                                </div>
                                <div className='flex-grow-1 ms-3'>
                                    <p className='text-muted mb-1' style={{ fontSize: '14px' }}>Inactive</p>
                                    <h5 className='mb-0' style={{ fontSize: '20px', fontWeight: '600' }}>
                                        {paymentMethods.filter(m => !m.status).length}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods Table */}
            <div className='card shadow-sm border-0'>
                <div className='card-header bg-white border-bottom'>
                    <div className='d-flex flex-wrap align-items-center gap-3'>
                        <div className='flex-grow-1'>
                            <div className='position-relative' style={{ maxWidth: '400px' }}>
                                <Icon
                                    icon='ion:search-outline'
                                    className='position-absolute top-50 translate-middle-y ms-3'
                                    style={{ fontSize: '20px', color: '#9ca3af', left: '0' }}
                                />
                                <input
                                    type='text'
                                    className='form-control ps-5'
                                    placeholder='Search by name or type...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        fontSize: '15px',
                                        padding: '12px 12px 12px 45px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                />
                            </div>
                        </div>
                        <div className='text-muted' style={{ fontSize: '15px' }}>
                            Showing <span className='fw-semibold text-dark'>{filteredMethods.length}</span> of <span className='fw-semibold text-dark'>{paymentMethods.length}</span> methods
                        </div>
                    </div>
                </div>

                <div className='card-body p-0'>
                    <div className='table-responsive'>
                        <table className='table table-hover mb-0'>
                            <thead style={{ backgroundColor: '#f9fafb' }}>
                                <tr style={{ fontSize: '15px' }}>
                                    <th scope='col' className='fw-semibold text-dark px-4 py-3'>Payment Method</th>
                                    <th scope='col' className='fw-semibold text-dark px-4 py-3'>Type</th>
                                    <th scope='col' className='fw-semibold text-dark px-4 py-3'>Configuration</th>
                                    <th scope='col' className='fw-semibold text-dark px-4 py-3'>Status</th>
                                    <th scope='col' className='text-center fw-semibold text-dark px-4 py-3'>Actions</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '15px' }}>
                                {filteredMethods.length === 0 ? (
                                    <tr>
                                        <td colSpan='5' className='text-center py-5'>
                                            <div className='d-flex flex-column align-items-center gap-3'>
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#f3f4f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Icon icon='mdi:credit-card-off-outline' className='text-secondary' style={{ fontSize: '40px' }} />
                                                </div>
                                                <div>
                                                    <p className='mb-1 fw-semibold' style={{ fontSize: '16px' }}>No payment methods found</p>
                                                    <p className='mb-0 text-muted' style={{ fontSize: '14px' }}>
                                                        {searchTerm ? 'Try adjusting your search' : 'Add your first payment method to get started'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMethods.map((method) => (
                                        <tr key={method._id}>
                                            <td className='px-4 py-3'>
                                                <div className='d-flex align-items-center gap-3'>
                                                    <div className='d-flex align-items-center justify-content-center' style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '12px',
                                                        backgroundColor: `${getMethodColor(method.name)}15`,
                                                        border: `1px solid ${getMethodColor(method.name)}30`
                                                    }}>
                                                        <Icon icon={getMethodIcon(method.name)} style={{ fontSize: '26px', color: getMethodColor(method.name) }} />
                                                    </div>
                                                    <div>
                                                        <span className='fw-semibold d-block' style={{ fontSize: '16px', color: '#111827' }}>
                                                            {method.name}
                                                        </span>
                                                        <span className='text-muted' style={{ fontSize: '13px' }}>
                                                            Payment Gateway
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='px-4 py-3'>
                                                <span className='badge' style={{
                                                    backgroundColor: '#f3f4f6',
                                                    color: '#374151',
                                                    fontSize: '14px',
                                                    padding: '8px 14px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px'
                                                }}>
                                                    {method.type}
                                                </span>
                                            </td>
                                            <td className='px-4 py-3'>
                                                {Object.keys(method.config || {}).length > 0 ? (
                                                    <span className='badge d-inline-flex align-items-center gap-1' style={{
                                                        backgroundColor: '#dcfce7',
                                                        color: '#16a34a',
                                                        fontSize: '14px',
                                                        padding: '8px 14px',
                                                        fontWeight: '500',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <Icon icon='mdi:check-circle' style={{ fontSize: '16px' }} />
                                                        Configured
                                                    </span>
                                                ) : (
                                                    <span className='badge d-inline-flex align-items-center gap-1' style={{
                                                        backgroundColor: '#fef3c7',
                                                        color: '#d97706',
                                                        fontSize: '14px',
                                                        padding: '8px 14px',
                                                        fontWeight: '500',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <Icon icon='mdi:alert-circle-outline' style={{ fontSize: '16px' }} />
                                                        Not Configured
                                                    </span>
                                                )}
                                            </td>
                                            <td className='px-4 py-3'>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <div className='form-check form-switch'>
                                                        <input
                                                            className='form-check-input'
                                                            type='checkbox'
                                                            role='switch'
                                                            checked={method.status}
                                                            onChange={() => handleToggleStatus(method._id, method.status)}
                                                            style={{ width: '52px', height: '28px', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                    <span className={`badge ${method.status ? 'bg-success' : 'bg-secondary'}`} style={{
                                                        fontSize: '14px',
                                                        minWidth: '75px',
                                                        padding: '6px 12px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {method.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='text-center px-4 py-3'>
                                                <div className='d-flex align-items-center gap-2 justify-content-center'>
                                                    <button
                                                        className='btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center'
                                                        onClick={() => navigate(`/edit-payment-method/${method._id}`)}
                                                        title='Edit Payment Method'
                                                        style={{
                                                            padding: '10px 16px',
                                                            borderRadius: '8px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <Icon icon='lucide:edit' style={{ fontSize: '18px' }} />
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center'
                                                        onClick={() => {
                                                            setDeleteId(method._id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title='Delete Payment Method'
                                                        style={{
                                                            padding: '10px 16px',
                                                            borderRadius: '8px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        <Icon icon='fluent:delete-24-regular' style={{ fontSize: '18px' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-dialog-centered'>
                        <div className='modal-content'>
                            <div className='modal-header border-0'>
                                <h5 className='modal-title' style={{ fontSize: '19px' }}>Confirm Delete</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                ></button>
                            </div>
                            <div className='modal-body text-center py-4'>
                                <Icon icon='mdi:alert-circle' style={{ fontSize: '64px', color: '#dc3545' }} />
                                <h5 className='mt-3' style={{ fontSize: '19px' }}>Are you sure?</h5>
                                <p style={{ fontSize: '15px' }}>Are you sure you want to delete this payment method? This action cannot be undone.</p>
                            </div>
                            <div className='modal-footer border-0 justify-content-center gap-2'>
                                <button
                                    type='button'
                                    className='btn btn-secondary-600 d-flex align-items-center px-4 py-2'
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                    style={{ fontSize: '15px' }}
                                >
                                    <Icon icon='mdi:close' className='me-2' style={{ fontSize: '20px' }} />
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-danger-600 d-flex align-items-center px-4 py-2'
                                    onClick={handleDelete}
                                    style={{ fontSize: '15px' }}
                                >
                                    <Icon icon='fluent:delete-24-regular' className='me-2' style={{ fontSize: '20px' }} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PaymentMethodsListLayer;
