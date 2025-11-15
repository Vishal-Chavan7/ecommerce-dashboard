import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const OrderReplacementListLayer = () => {
    const navigate = useNavigate();
    const [replacements, setReplacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch replacements from API
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }
        fetchReplacements();
    }, []);

    const fetchReplacements = async () => {
        try {
            setLoading(true);
            const response = await api.get('/order-replacements');
            setReplacements(response.data || []);
        } catch (error) {
            console.error('Error fetching order replacements:', error);
            if (error.status !== 401) {
                toast.error('Failed to fetch order replacements');
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete replacement
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this replacement request?')) return;

        try {
            await api.delete(`/order-replacements/${id}`);
            toast.success('Replacement request deleted successfully');
            fetchReplacements();
        } catch (error) {
            console.error('Error deleting replacement:', error);
            toast.error('Failed to delete replacement request');
        }
    };

    // Filter and search logic
    const filteredReplacements = replacements.filter(replacement => {
        const matchesSearch = !searchTerm ||
            replacement._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            replacement.orderId?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            replacement.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            replacement.reason?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || replacement.status === statusFilter;

        const matchesDate = !dateFilter ||
            new Date(replacement.createdAt).toISOString().split('T')[0] === dateFilter;

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReplacements = filteredReplacements.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReplacements.length / itemsPerPage);

    // Statistics
    const stats = {
        total: replacements.length,
        requested: replacements.filter(r => r.status === 'requested').length,
        approved: replacements.filter(r => r.status === 'approved').length,
        shipped: replacements.filter(r => r.status === 'shipped').length,
        completed: replacements.filter(r => r.status === 'completed').length
    };

    // Status badge color
    const getStatusBadge = (status) => {
        const badges = {
            requested: 'bg-warning-focus text-warning-600 border-warning-600',
            approved: 'bg-success-focus text-success-600 border-success-600',
            shipped: 'bg-info-focus text-info-600 border-info-600',
            completed: 'bg-primary-focus text-primary-600 border-primary-600'
        };
        return badges[status] || 'bg-neutral-200 text-neutral-600';
    };

    // Status icon
    const getStatusIcon = (status) => {
        const icons = {
            requested: 'mdi:clock-outline',
            approved: 'mdi:check-circle',
            shipped: 'mdi:truck-delivery',
            completed: 'mdi:check-all'
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
                    <h6 className="text-lg mb-0">Order Replacements Management</h6>
                    <Link
                        to="/add-order-replacement"
                        className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                    >
                        <Icon icon="mdi:plus" className="icon text-xl" />
                        Add Replacement Request
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
                                        <p className="fw-medium text-primary-light mb-1">Total Replacements</p>
                                        <h6 className="mb-0">{stats.total}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-cyan rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:package-variant" className="text-white text-2xl mb-0" />
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
                                        <p className="fw-medium text-primary-light mb-1">Shipped</p>
                                        <h6 className="mb-0">{stats.shipped}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-info rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:truck-delivery" className="text-white text-2xl mb-0" />
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
                                        <p className="fw-medium text-primary-light mb-1">Completed</p>
                                        <h6 className="mb-0">{stats.completed}</h6>
                                    </div>
                                    <div className="w-50-px h-50-px bg-success rounded-circle d-flex justify-content-center align-items-center">
                                        <Icon icon="mdi:check-all" className="text-white text-2xl mb-0" />
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
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
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

                {/* Replacements Table */}
                <div className="table-responsive">
                    <table className="table bordered-table mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Replacement ID</th>
                                <th scope="col">Order ID</th>
                                <th scope="col">Customer</th>
                                <th scope="col">Items Count</th>
                                <th scope="col">Status</th>
                                <th scope="col">Date</th>
                                <th scope="col" className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReplacements.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        <Icon icon="mdi:package-variant-remove" className="text-secondary-light" style={{ fontSize: '48px' }} />
                                        <p className="mt-2 text-secondary-light">No replacement requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentReplacements.map((replacement) => (
                                    <tr key={replacement._id}>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                #{replacement._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {replacement.orderId ? (
                                                <span className="text-sm">
                                                    #{replacement.orderId._id.slice(-8).toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-muted">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <span className="text-md mb-0 fw-normal text-secondary-light">
                                                        {replacement.userId?.name || 'Unknown User'}
                                                    </span>
                                                    <br />
                                                    <span className="text-xs text-secondary-light">
                                                        {replacement.userId?.email || ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-neutral-200 text-neutral-600 px-2 py-1">
                                                {replacement.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(replacement.status)} px-24 py-9 radius-4 fw-medium text-sm`}>
                                                <Icon icon={getStatusIcon(replacement.status)} className="me-1" />
                                                {replacement.status.charAt(0).toUpperCase() + replacement.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {new Date(replacement.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex align-items-center gap-10 justify-content-center">
                                                <Link
                                                    to={`/view-order-replacement/${replacement._id}`}
                                                    className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    title="View Details"
                                                >
                                                    <Icon icon="mdi:eye" className="icon text-xl" />
                                                </Link>
                                                <Link
                                                    to={`/edit-order-replacement/${replacement._id}`}
                                                    className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    title="Edit Replacement"
                                                >
                                                    <Icon icon="mdi:pencil" className="icon text-xl" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(replacement._id)}
                                                    className="bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                    title="Delete Replacement"
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
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReplacements.length)} of {filteredReplacements.length} entries
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

export default OrderReplacementListLayer;
