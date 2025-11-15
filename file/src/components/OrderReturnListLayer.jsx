import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const OrderReturnListLayer = () => {
    const navigate = useNavigate();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch returns from API
    useEffect(() => {
        // Check authentication before fetching
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const response = await api.get('/order-returns');
            setReturns(response.data || []);
        } catch (error) {
            console.error('Error fetching order returns:', error);
            // Don't show toast if it's a 401 (axios interceptor handles redirect)
            if (error.status !== 401) {
                toast.error('Failed to fetch order returns');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete return
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this return request?')) return;

        try {
            await api.delete(`/order-returns/${id}`);
            toast.success('Return request deleted successfully');
            fetchReturns();
        } catch (error) {
            console.error('Error deleting return:', error);
            toast.error('Failed to delete return request');
        }
    };

    // Filter and search logic
    const filteredReturns = returns.filter(returnItem => {
        const matchesSearch = !searchTerm ||
            returnItem._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            returnItem.orderId?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            returnItem.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            returnItem.items?.some(item =>
                item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
            );

        const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter;

        const matchesDate = !dateFilter ||
            new Date(returnItem.createdAt).toISOString().split('T')[0] === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReturns = filteredReturns.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

    // Statistics
    const stats = {
        total: returns.length,
        requested: returns.filter(r => r.status === 'requested').length,
        approved: returns.filter(r => r.status === 'approved').length,
        rejected: returns.filter(r => r.status === 'rejected').length,
        refunded: returns.filter(r => r.status === 'refunded').length
    };

    // Status badge color
    const getStatusBadge = (status) => {
        const badges = {
            requested: 'bg-warning-focus text-warning-600 border-warning-600',
            approved: 'bg-success-focus text-success-600 border-success-600',
            rejected: 'bg-danger-focus text-danger-600 border-danger-600',
            refunded: 'bg-info-focus text-info-600 border-info-600'
        };
        return badges[status] || 'bg-neutral-200 text-neutral-600';
    };

    // Status icon
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

    return (
        <div className="card">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <h6 className="text-lg mb-0">Order Returns Management</h6>
                    <Link
                        to="/add-order-return"
                        className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                    >
                        <Icon icon="mdi:plus" className="icon text-xl" />
                        Add Return Request
                    </Link>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="card-body">
                <div className="row g-3 mb-24">
                    <div className="col-xxl col-sm-6">
                        <div className="card shadow-none border bg-gradient-start-1 h-100">
                            <div className="card-body p-20">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    <div>
                                        <p className="fw-medium text-primary-light mb-1">Total Returns</p>
                                        <h6 className="mb-0">{stats.total}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:package-variant-closed" className="text-white text-2xl mb-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl col-sm-6">
                        <div className="card shadow-none border bg-gradient-start-2 h-100">
                            <div className="card-body p-20">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    <div>
                                        <p className="fw-medium text-primary-light mb-1">Requested</p>
                                        <h6 className="mb-0">{stats.requested}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-yellow rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:clock-outline" className="text-white text-2xl mb-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl col-sm-6">
                        <div className="card shadow-none border bg-gradient-start-3 h-100">
                            <div className="card-body p-20">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    <div>
                                        <p className="fw-medium text-primary-light mb-1">Approved</p>
                                        <h6 className="mb-0">{stats.approved}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-success rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:check-circle" className="text-white text-2xl mb-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl col-sm-6">
                        <div className="card shadow-none border bg-gradient-start-4 h-100">
                            <div className="card-body p-20">
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    <div>
                                        <p className="fw-medium text-primary-light mb-1">Refunded</p>
                                        <h6 className="mb-0">{stats.refunded}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:cash-refund" className="text-white text-2xl mb-0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="row g-3 mb-24">
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by ID, order, user, reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="requested">Requested</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <input
                            type="date"
                            className="form-control"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setDateFilter('');
                                setCurrentPage(1);
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Returns Table */}
                <div className="table-responsive">
                    <table className="table bordered-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Return ID</th>
                                <th scope="col">Order ID</th>
                                <th scope="col">Customer</th>
                                <th scope="col">Items Count</th>
                                <th scope="col">Status</th>
                                <th scope="col">Date</th>
                                <th scope="col" className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReturns.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <Icon icon="mdi:package-variant-closed-remove" className="text-secondary-light" style={{ fontSize: '48px' }} />
                                        <p className="mt-2 text-secondary-light">No return requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentReturns.map((returnItem) => (
                                    <tr key={returnItem._id}>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                #{returnItem._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {returnItem.orderId ? (
                                                <span className="text-sm">
                                                    #{returnItem.orderId._id.slice(-8).toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <span className="text-md mb-0 fw-normal text-secondary-light">
                                                        {returnItem.userId?.name || 'Unknown User'}
                                                    </span>
                                                    <br />
                                                    <span className="text-xs text-secondary-light">
                                                        {returnItem.userId?.email || ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-neutral-200 text-neutral-600 px-2 py-1">
                                                {returnItem.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(returnItem.status)} px-24 py-9 radius-4 fw-medium text-sm`}>
                                                <Icon icon={getStatusIcon(returnItem.status)} className="me-1" />
                                                {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {new Date(returnItem.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex align-items-center gap-10 justify-content-center">
                                                <Link
                                                    to={`/view-order-return/${returnItem._id}`}
                                                    className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    title="View Details"
                                                >
                                                    <Icon icon="mdi:eye" className="icon text-xl" />
                                                </Link>
                                                <Link
                                                    to={`/edit-order-return/${returnItem._id}`}
                                                    className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    title="Edit Return"
                                                >
                                                    <Icon icon="mdi:pencil" className="icon text-xl" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(returnItem._id)}
                                                    className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    title="Delete Return"
                                                >
                                                    <Icon icon="mdi:delete" className="icon text-xl" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
                        <span className="text-sm text-secondary-light">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReturns.length)} of {filteredReturns.length} entries
                        </span>
                        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                            <li className="page-item">
                                <button
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <Icon icon="ep:d-arrow-left" />
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, index) => (
                                <li key={index} className="page-item">
                                    <button
                                        className={`page-link fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md ${currentPage === index + 1
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-neutral-200 text-secondary-light'
                                            }`}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li className="page-item">
                                <button
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <Icon icon="ep:d-arrow-right" />
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderReturnListLayer;
