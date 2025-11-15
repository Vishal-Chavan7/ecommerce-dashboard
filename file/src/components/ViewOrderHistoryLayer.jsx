import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const ViewOrderHistoryLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [historyEntry, setHistoryEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState(null);
    const [userDetails, setUserDetails] = useState(null);

    const statusOptions = {
        pending: { label: 'Pending', color: 'warning', icon: 'mdi:clock-outline' },
        processing: { label: 'Processing', color: 'info', icon: 'mdi:package-variant' },
        shipped: { label: 'Shipped', color: 'primary', icon: 'mdi:truck-delivery' },
        delivered: { label: 'Delivered', color: 'success', icon: 'mdi:check-circle' },
        cancelled: { label: 'Cancelled', color: 'danger', icon: 'mdi:close-circle' },
        returned: { label: 'Returned', color: 'secondary', icon: 'mdi:package-variant-closed' },
        refunded: { label: 'Refunded', color: 'info', icon: 'mdi:cash-refund' }
    };

    useEffect(() => {
        // Check authentication before fetching
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }

        fetchOrderHistory();
    }, [id]);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/order-history/${id}`);
            const history = response.data;
            setHistoryEntry(history);

            // Fetch related order details if orderId exists
            if (history.orderId) {
                try {
                    const orderResponse = await api.get(`/orders/${history.orderId}`);
                    setOrderDetails(orderResponse.data.order || orderResponse.data);
                } catch (err) {
                    console.warn('Could not fetch order details:', err);
                }
            }

            // Fetch user details if updatedBy exists
            if (history.updatedBy) {
                try {
                    const userResponse = await api.get(`/admin/users/${history.updatedBy}`);
                    setUserDetails(userResponse.data.user || userResponse.data);
                } catch (err) {
                    console.warn('Could not fetch user details:', err);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching order history:', error);

            // Don't show toast if it's a 401 (axios interceptor will handle redirect)
            if (error.status !== 401) {
                toast.error('Failed to load order history details');
            }
            navigate('/order-history');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/edit-order-history/${id}`);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this order history entry?')) {
            return;
        }

        try {
            await api.delete(`/order-history/${id}`);
            toast.success('Order history entry deleted successfully');
            navigate('/order-history');
        } catch (error) {
            console.error('❌ Error deleting entry:', error);
            toast.error('Failed to delete order history entry');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getStatusInfo = (status) => {
        return statusOptions[status] || { label: status, color: 'secondary', icon: 'mdi:help-circle' };
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!historyEntry) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <Icon icon="mdi:alert-circle" width="64" className="text-warning mb-3" />
                    <h5>Order History Entry Not Found</h5>
                    <button className="btn btn-primary mt-3" onClick={() => navigate('/order-history')}>
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(historyEntry.status);

    return (
        <div className="row">
            {/* Main Details Card */}
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <Icon icon="mdi:history" width="24" className="me-2" />
                            Order History Details
                        </h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-primary" onClick={handleEdit}>
                                <Icon icon="mdi:pencil" width="16" className="me-1" />
                                Edit
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                                <Icon icon="mdi:delete" width="16" className="me-1" />
                                Delete
                            </button>
                            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/order-history')}>
                                <Icon icon="mdi:arrow-left" width="16" className="me-1" />
                                Back
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        {/* Status Badge */}
                        <div className="mb-4 text-center p-4 bg-light rounded">
                            <Icon icon={statusInfo.icon} width="64" className={`text-${statusInfo.color} mb-3`} />
                            <h3 className={`text-${statusInfo.color} mb-2`}>{statusInfo.label}</h3>
                            <p className="text-muted mb-0">Current Order Status</p>
                        </div>

                        {/* Entry Information */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="p-3 border rounded">
                                    <div className="d-flex align-items-center mb-2">
                                        <Icon icon="mdi:identifier" width="20" className="text-primary me-2" />
                                        <strong>Entry ID</strong>
                                    </div>
                                    <div className="text-muted">
                                        <code>{historyEntry._id}</code>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 border rounded">
                                    <div className="d-flex align-items-center mb-2">
                                        <Icon icon="mdi:calendar-clock" width="20" className="text-success me-2" />
                                        <strong>Created At</strong>
                                    </div>
                                    <div className="text-muted">{formatDate(historyEntry.createdAt)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Order ID */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <Icon icon="mdi:package" width="20" className="text-info me-2" />
                                <strong>Order ID</strong>
                            </div>
                            <div className="p-3 bg-light rounded">
                                <code className="text-dark fs-6">
                                    {typeof historyEntry.orderId === 'object'
                                        ? historyEntry.orderId?._id
                                        : historyEntry.orderId}
                                </code>
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <Icon icon="mdi:comment-text" width="20" className="text-warning me-2" />
                                <strong>Comment</strong>
                            </div>
                            <div className="p-3 border rounded bg-light">
                                {historyEntry.comment || <span className="text-muted">No comment provided</span>}
                            </div>
                        </div>

                        {/* Updated By */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <Icon icon="mdi:account" width="20" className="text-secondary me-2" />
                                <strong>Updated By</strong>
                            </div>
                            <div className="p-3 border rounded">
                                {userDetails ? (
                                    <div className="d-flex align-items-center">
                                        <div className="avatar me-3">
                                            <div className="avatar-title rounded-circle bg-primary">
                                                {userDetails.name?.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{userDetails.name}</div>
                                            <small className="text-muted">{userDetails.email}</small>
                                            {userDetails.roles && (
                                                <div className="mt-1">
                                                    {userDetails.roles.map(role => (
                                                        <span key={role} className="badge bg-info me-1">{role}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : historyEntry.updatedBy ? (
                                    <span className="text-muted">User ID: {historyEntry.updatedBy}</span>
                                ) : (
                                    <span className="text-muted">System (Automated)</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar - Order Details */}
            <div className="col-lg-4">
                {orderDetails && (
                    <div className="card">
                        <div className="card-header">
                            <h6 className="mb-0">
                                <Icon icon="mdi:package-variant" width="20" className="me-2" />
                                Related Order
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <small className="text-muted d-block mb-1">Order Number</small>
                                <strong>#{orderDetails._id?.toString().slice(-8)}</strong>
                            </div>
                            {orderDetails.userId && (
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Customer</small>
                                    <strong>{orderDetails.userId.name || 'N/A'}</strong>
                                </div>
                            )}
                            {orderDetails.totalAmount !== undefined && (
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Total Amount</small>
                                    <strong className="text-success">₹{orderDetails.totalAmount.toFixed(2)}</strong>
                                </div>
                            )}
                            {orderDetails.status && (
                                <div className="mb-3">
                                    <small className="text-muted d-block mb-1">Current Status</small>
                                    <span className={`badge bg-${getStatusInfo(orderDetails.status).color}`}>
                                        {orderDetails.status}
                                    </span>
                                </div>
                            )}
                            <button
                                className="btn btn-sm btn-outline-primary w-100 mt-3"
                                onClick={() => navigate(`/view-order/${orderDetails._id}`)}
                            >
                                <Icon icon="mdi:eye" width="16" className="me-1" />
                                View Full Order
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions Card */}
                <div className="card mt-3">
                    <div className="card-header">
                        <h6 className="mb-0">
                            <Icon icon="mdi:cog" width="20" className="me-2" />
                            Quick Actions
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="d-grid gap-2">
                            <button className="btn btn-outline-primary" onClick={handleEdit}>
                                <Icon icon="mdi:pencil" width="18" className="me-2" />
                                Edit Entry
                            </button>
                            <button className="btn btn-outline-danger" onClick={handleDelete}>
                                <Icon icon="mdi:delete" width="18" className="me-2" />
                                Delete Entry
                            </button>
                            <button className="btn btn-outline-secondary" onClick={() => navigate('/order-history')}>
                                <Icon icon="mdi:format-list-bulleted" width="18" className="me-2" />
                                View All History
                            </button>
                            <button className="btn btn-outline-success" onClick={() => navigate('/add-order-history')}>
                                <Icon icon="mdi:plus" width="18" className="me-2" />
                                Add New Entry
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="card mt-3 bg-light">
                    <div className="card-body">
                        <div className="d-flex align-items-start">
                            <Icon icon="mdi:information" width="24" className="text-info me-2 mt-1" />
                            <div>
                                <h6 className="mb-2">About Order History</h6>
                                <small className="text-muted">
                                    Order history entries track every status change for auditing and customer transparency.
                                    Each entry records who made the change and when it occurred.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderHistoryLayer;
