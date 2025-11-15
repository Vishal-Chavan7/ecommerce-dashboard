import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const ViewOrderReturnLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [returnData, setReturnData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication before fetching
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }
        fetchReturnData();
    }, [id]);

    const fetchReturnData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/order-returns/${id}`);
            setReturnData(response.data);
        } catch (error) {
            console.error('Error fetching return details:', error);
            // Don't show toast if it's a 401
            if (error.status !== 401) {
                toast.error('Failed to fetch return details');
            }
            navigate('/order-returns');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this return request?')) return;

        try {
            await api.delete(`/order-returns/${id}`);
            toast.success('Return request deleted successfully');
            navigate('/order-returns');
        } catch (error) {
            console.error('Error deleting return:', error);
            toast.error('Failed to delete return request');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            requested: 'warning',
            approved: 'success',
            rejected: 'danger',
            refunded: 'info'
        };
        return colors[status] || 'secondary';
    };

    const getStatusIcon = (status) => {
        const icons = {
            requested: 'mdi:clock-outline',
            approved: 'mdi:check-circle',
            rejected: 'mdi:close-circle',
            refunded: 'mdi:cash-refund'
        };
        return icons[status] || 'mdi:help-circle';
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!returnData) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <Icon icon="mdi:package-variant-closed-remove" style={{ fontSize: '64px' }} className="text-secondary-light" />
                    <h5 className="mt-3">Return Request Not Found</h5>
                    <Link to="/order-returns" className="btn btn-primary mt-3">
                        Back to Returns List
                    </Link>
                </div>
            </div>
        );
    }

    const statusColor = getStatusColor(returnData.status);

    return (
        <div className="row gy-4">
            {/* Main Details Card */}
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header border-bottom bg-base py-16 px-24">
                        <div className="d-flex justify-content-between align-items-center">
                            <h6 className="text-lg mb-0">Return Request Details</h6>
                            <span className={`badge bg-${statusColor}-focus text-${statusColor}-600 border border-${statusColor}-600 px-24 py-9 radius-4 fw-medium text-sm`}>
                                <Icon icon={getStatusIcon(returnData.status)} className="me-1" style={{ fontSize: '18px' }} />
                                {returnData.status.charAt(0).toUpperCase() + returnData.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="card-body p-24">
                        {/* Return Information */}
                        <div className="mb-24">
                            <h6 className="text-md mb-16">Return Information</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex flex-column gap-1">
                                        <span className="text-secondary-light text-sm">Return ID</span>
                                        <span className="fw-semibold">#{returnData._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex flex-column gap-1">
                                        <span className="text-secondary-light text-sm">Request Date</span>
                                        <span className="fw-semibold">
                                            {new Date(returnData.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Returned Items */}
                        <div className="mb-24">
                            <h6 className="text-md mb-16">Returned Items ({returnData.items?.length || 0})</h6>
                            <div className="table-responsive">
                                <table className="table bordered-table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {returnData.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        {item.productId?.images?.[0] && (
                                                            <img
                                                                src={item.productId.images[0]}
                                                                alt={item.productId.title}
                                                                className="w-40-px h-40-px rounded-4 object-fit-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <h6 className="text-md mb-0 fw-medium">
                                                                {item.productId?.title || 'Unknown Product'}
                                                            </h6>
                                                            {item.productId?.sku && (
                                                                <span className="text-xs text-secondary-light">
                                                                    SKU: {item.productId.sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-neutral-200 text-neutral-600 px-2 py-1">
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td>
                                                    <p className="text-sm mb-0">{item.reason || 'No reason provided'}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="mb-24">
                            <h6 className="text-md mb-16">Customer Information</h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="d-flex flex-column gap-1">
                                        <span className="text-secondary-light text-sm">Name</span>
                                        <span className="fw-semibold">{returnData.userId?.name || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="d-flex flex-column gap-1">
                                        <span className="text-secondary-light text-sm">Email</span>
                                        <span className="fw-semibold">{returnData.userId?.email || 'N/A'}</span>
                                    </div>
                                </div>
                                {returnData.userId?.phone && (
                                    <div className="col-md-6">
                                        <div className="d-flex flex-column gap-1">
                                            <span className="text-secondary-light text-sm">Phone</span>
                                            <span className="fw-semibold">{returnData.userId.phone}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
                {/* Related Order Card */}
                <div className="card mb-20">
                    <div className="card-header border-bottom bg-base py-16 px-24">
                        <h6 className="text-md mb-0">Related Order</h6>
                    </div>
                    <div className="card-body p-24">
                        {returnData.orderId ? (
                            <>
                                <div className="d-flex flex-column gap-3">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary-light text-sm">Order ID</span>
                                        <span className="fw-semibold text-sm">
                                            #{returnData.orderId._id.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary-light text-sm">Total Amount</span>
                                        <span className="fw-semibold text-sm">
                                            ${returnData.orderId.totalAmount}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-secondary-light text-sm">Status</span>
                                        <span className="badge bg-neutral-200 text-neutral-600 text-xs">
                                            {returnData.orderId.status}
                                        </span>
                                    </div>
                                    {returnData.orderId.createdAt && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-secondary-light text-sm">Order Date</span>
                                            <span className="text-sm">
                                                {new Date(returnData.orderId.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to={`/view-order/${returnData.orderId._id}`}
                                    className="btn btn-outline-primary w-100 mt-16"
                                >
                                    <Icon icon="mdi:eye" className="me-1" />
                                    View Full Order
                                </Link>
                            </>
                        ) : (
                            <p className="text-secondary-light text-sm mb-0">No order information available</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions Card */}
                <div className="card">
                    <div className="card-header border-bottom bg-base py-16 px-24">
                        <h6 className="text-md mb-0">Quick Actions</h6>
                    </div>
                    <div className="card-body p-24">
                        <div className="d-flex flex-column gap-2">
                            <Link
                                to={`/edit-order-return/${returnData._id}`}
                                className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                            >
                                <Icon icon="mdi:pencil" className="text-xl" />
                                Edit Return
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                            >
                                <Icon icon="mdi:delete" className="text-xl" />
                                Delete Return
                            </button>
                            <Link
                                to="/order-returns"
                                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
                            >
                                <Icon icon="mdi:arrow-left" className="text-xl" />
                                Back to List
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewOrderReturnLayer;
