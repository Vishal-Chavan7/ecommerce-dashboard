import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditOrderHistoryLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        orderId: '',
        status: 'pending',
        comment: '',
        updatedBy: ''
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);

    // Order status options
    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'warning', icon: 'mdi:clock-outline', description: 'Order is pending confirmation' },
        { value: 'processing', label: 'Processing', color: 'info', icon: 'mdi:package-variant', description: 'Order is being processed' },
        { value: 'shipped', label: 'Shipped', color: 'primary', icon: 'mdi:truck-delivery', description: 'Order has been shipped' },
        { value: 'delivered', label: 'Delivered', color: 'success', icon: 'mdi:check-circle', description: 'Order has been delivered' },
        { value: 'cancelled', label: 'Cancelled', color: 'danger', icon: 'mdi:close-circle', description: 'Order has been cancelled' },
        { value: 'returned', label: 'Returned', color: 'secondary', icon: 'mdi:package-variant-closed', description: 'Order has been returned' },
        { value: 'refunded', label: 'Refunded', color: 'info', icon: 'mdi:cash-refund', description: 'Payment has been refunded' }
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        console.log('=== AddEditOrderHistory Mount ===');
        console.log('Token exists:', !!token);
        console.log('User exists:', !!user);

        if (!token) {
            console.error('❌ No token found - redirecting to login');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }

        // Add delay to ensure component is mounted
        const timer = setTimeout(() => {
            console.log('🔄 Starting data fetch...');

            // Fetch initial data
            const fetchData = async () => {
                try {
                    const ordersSuccess = await fetchOrders();
                    const usersSuccess = await fetchUsers();

                    console.log('✅ Fetch results - Orders:', ordersSuccess, 'Users:', usersSuccess);

                    if (isEditMode) {
                        await fetchOrderHistory();
                    }
                } catch (error) {
                    console.error('❌ Error in fetchData:', error);
                }
            };
            fetchData();
        }, 100);

        return () => clearTimeout(timer);
    }, [id]);

    const fetchOrders = async () => {
        console.log('📦 fetchOrders: Starting...');
        try {
            const response = await api.get('/orders');
            console.log('📦 fetchOrders: SUCCESS -', response.data);
            setOrders(response.data.data || []);
            return true;
        } catch (error) {
            console.error('❌ fetchOrders: FAILED -', error);
            console.error('❌ Error status:', error.status);

            // Don't show toast if it's a 401 (axios interceptor will handle redirect)
            if (error.status !== 401) {
                toast.error('Failed to fetch orders. You can still select orders manually.');
            }
            return false;
        }
    };

    const fetchUsers = async () => {
        console.log('👥 fetchUsers: Starting...');
        try {
            const response = await api.get('/admin/users');
            console.log('👥 fetchUsers: SUCCESS -', response.data);
            setUsers(response.data.users || []);
            return true;
        } catch (error) {
            console.error('❌ fetchUsers: FAILED -', error);
            console.error('❌ Error status:', error.status);

            // Don't show toast if it's a 401 (axios interceptor will handle redirect)
            if (error.status !== 401) {
                toast.error('Failed to fetch users. You can still proceed without selecting a user.');
            }
            return false;
        }
    };

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/order-history/${id}`);
            const history = response.data;
            setFormData({
                orderId: history.orderId?._id || history.orderId || '',
                status: history.status || 'pending',
                comment: history.comment || '',
                updatedBy: history.updatedBy?._id || history.updatedBy || ''
            });
        } catch (error) {
            console.error('❌ Error fetching order history:', error);
            toast.error('Failed to load order history');
            navigate('/order-history');
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

        if (!formData.orderId) {
            errors.orderId = 'Please select an order';
        }

        if (!formData.status) {
            errors.status = 'Please select a status';
        }

        if (!formData.comment || formData.comment.trim().length < 5) {
            errors.comment = 'Comment must be at least 5 characters';
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

        setLoading(true);

        try {
            const payload = {
                orderId: formData.orderId,
                status: formData.status,
                comment: formData.comment.trim(),
                updatedBy: formData.updatedBy || undefined
            };

            if (isEditMode) {
                await api.put(`/order-history/${id}`, payload);
                toast.success('Order history updated successfully');
            } else {
                await api.post('/order-history', payload);
                toast.success('Order history entry created successfully');
            }

            navigate('/order-history');
        } catch (error) {
            console.error('❌ Error saving order history:', error);
            toast.error(error.response?.data?.error || 'Failed to save order history');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            navigate('/order-history');
        }
    };

    const getOrderDisplay = (order) => {
        if (!order) return 'Select an order';
        return `Order #${order._id?.toString().slice(-8)} - ${order.userId?.name || 'N/A'}`;
    };

    const getUserDisplay = (user) => {
        if (!user) return 'Select a user';
        return `${user.name} (${user.email})`;
    };

    if (loading && isEditMode) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">
                    <Icon icon={isEditMode ? "mdi:pencil" : "mdi:plus"} width="24" className="me-2" />
                    {isEditMode ? 'Edit Order History' : 'Add Order History Entry'}
                </h5>
            </div>

            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    {/* Order Selection */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <label className="form-label required">
                                <Icon icon="mdi:package" width="18" className="me-1" />
                                Order
                            </label>
                            <select
                                className={`form-select ${validationErrors.orderId ? 'is-invalid' : ''}`}
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="">Select an order</option>
                                {orders.map(order => (
                                    <option key={order._id} value={order._id}>
                                        {getOrderDisplay(order)}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.orderId && (
                                <div className="invalid-feedback">{validationErrors.orderId}</div>
                            )}
                            <small className="form-text text-muted">
                                Select the order for which this history entry is being created
                            </small>
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <label className="form-label required">
                                <Icon icon="mdi:list-status" width="18" className="me-1" />
                                Order Status
                            </label>
                            <div className="row g-3">
                                {statusOptions.map(option => (
                                    <div key={option.value} className="col-md-6 col-lg-4">
                                        <div
                                            className={`card h-100 cursor-pointer ${formData.status === option.value
                                                ? `border-${option.color} shadow-sm`
                                                : 'border-light'
                                                }`}
                                            onClick={() => handleInputChange({ target: { name: 'status', value: option.value } })}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            <div className="card-body text-center p-3">
                                                <Icon
                                                    icon={option.icon}
                                                    width="32"
                                                    className={`mb-2 text-${option.color}`}
                                                />
                                                <h6 className="mb-1">{option.label}</h6>
                                                <small className="text-muted">{option.description}</small>
                                                {formData.status === option.value && (
                                                    <div className="mt-2">
                                                        <Icon icon="mdi:check-circle" width="20" className={`text-${option.color}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {validationErrors.status && (
                                <div className="text-danger mt-2">
                                    <small>{validationErrors.status}</small>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <label className="form-label required">
                                <Icon icon="mdi:comment-text" width="18" className="me-1" />
                                Comment
                            </label>
                            <textarea
                                className={`form-control ${validationErrors.comment ? 'is-invalid' : ''}`}
                                name="comment"
                                value={formData.comment}
                                onChange={handleInputChange}
                                rows="4"
                                placeholder="Enter detailed comment about this status change..."
                                disabled={loading}
                            />
                            {validationErrors.comment && (
                                <div className="invalid-feedback">{validationErrors.comment}</div>
                            )}
                            <small className="form-text text-muted">
                                Provide a detailed explanation for this status change (minimum 5 characters)
                            </small>
                        </div>
                    </div>

                    {/* Updated By */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <label className="form-label">
                                <Icon icon="mdi:account" width="18" className="me-1" />
                                Updated By (Optional)
                            </label>
                            <select
                                className="form-select"
                                name="updatedBy"
                                value={formData.updatedBy}
                                onChange={handleInputChange}
                                disabled={loading}
                            >
                                <option value="">System (Auto)</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {getUserDisplay(user)}
                                    </option>
                                ))}
                            </select>
                            <small className="form-text text-muted">
                                Select the admin/staff who made this change (leave empty for system)
                            </small>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="row">
                        <div className="col-md-12">
                            <div className="d-flex justify-content-end gap-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    <Icon icon="mdi:close" width="18" className="me-1" />
                                    Cancel
                                </button>
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
                                            <Icon icon="mdi:content-save" width="18" className="me-1" />
                                            {isEditMode ? 'Update' : 'Create'} History Entry
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditOrderHistoryLayer;
