import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const OrderHistoryListLayer = () => {
    const navigate = useNavigate();
    const [historyEntries, setHistoryEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Order status options
    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending', color: 'warning', icon: 'mdi:clock-outline' },
        { value: 'processing', label: 'Processing', color: 'info', icon: 'mdi:package-variant' },
        { value: 'shipped', label: 'Shipped', color: 'primary', icon: 'mdi:truck-delivery' },
        { value: 'delivered', label: 'Delivered', color: 'success', icon: 'mdi:check-circle' },
        { value: 'cancelled', label: 'Cancelled', color: 'danger', icon: 'mdi:close-circle' },
        { value: 'returned', label: 'Returned', color: 'secondary', icon: 'mdi:package-variant-closed' },
        { value: 'refunded', label: 'Refunded', color: 'info', icon: 'mdi:cash-refund' }
    ];

    useEffect(() => {
        // Check authentication before fetching
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No authentication token found');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }

        fetchHistoryEntries();
    }, []);

    useEffect(() => {
        filterEntries();
    }, [historyEntries, searchTerm, statusFilter, dateFilter]);

    const fetchHistoryEntries = async () => {
        try {
            setLoading(true);
            console.log('📋 Fetching order history entries...');
            const response = await api.get('/order-history');
            console.log('✅ Order history fetched:', response.data);
            setHistoryEntries(response.data || []);
        } catch (error) {
            console.error('❌ Error fetching order history:', error);

            // Don't show toast if it's a 401 (axios interceptor will handle redirect)
            if (error.status !== 401) {
                toast.error('Failed to fetch order history');
            }
        } finally {
            setLoading(false);
        }
    };

    const filterEntries = () => {
        let filtered = [...historyEntries];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(entry =>
                entry.orderId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.comment?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter) {
            filtered = filtered.filter(entry => entry.status === statusFilter);
        }

        // Date filter
        if (dateFilter) {
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.createdAt).toLocaleDateString();
                return entryDate === new Date(dateFilter).toLocaleDateString();
            });
        }

        setFilteredEntries(filtered);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order history entry?')) {
            return;
        }

        try {
            await api.delete(`/order-history/${id}`);
            toast.success('Order history entry deleted successfully');
            fetchHistoryEntries();
        } catch (error) {
            console.error('❌ Error deleting entry:', error);
            toast.error('Failed to delete order history entry');
        }
    };

    const getStatusBadge = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        if (!statusOption) {
            return <span className="badge bg-secondary">{status}</span>;
        }
        return (
            <span className={`badge bg-${statusOption.color} d-flex align-items-center gap-1`} style={{ width: 'fit-content' }}>
                <Icon icon={statusOption.icon} width="16" />
                {statusOption.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEntries.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                    <Icon icon="mdi:history" width="24" className="me-2" />
                    Order History
                </h5>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/add-order-history')}
                >
                    <Icon icon="mdi:plus" width="18" className="me-1" />
                    Add History Entry
                </button>
            </div>

            <div className="card-body">
                {/* Filters */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="input-group">
                            <span className="input-group-text">
                                <Icon icon="mdi:magnify" width="18" />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by order ID, status, or comment..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
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
                                setStatusFilter('');
                                setDateFilter('');
                            }}
                        >
                            <Icon icon="mdi:refresh" width="18" className="me-1" />
                            Clear
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <Icon icon="mdi:history" width="32" className="text-primary mb-2" />
                                <h5 className="mb-0">{historyEntries.length}</h5>
                                <small className="text-muted">Total Entries</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <Icon icon="mdi:check-circle" width="32" className="text-success mb-2" />
                                <h5 className="mb-0">
                                    {historyEntries.filter(e => e.status === 'delivered').length}
                                </h5>
                                <small className="text-muted">Delivered</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <Icon icon="mdi:package-variant" width="32" className="text-info mb-2" />
                                <h5 className="mb-0">
                                    {historyEntries.filter(e => e.status === 'processing' || e.status === 'shipped').length}
                                </h5>
                                <small className="text-muted">In Progress</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <Icon icon="mdi:close-circle" width="32" className="text-danger mb-2" />
                                <h5 className="mb-0">
                                    {historyEntries.filter(e => e.status === 'cancelled').length}
                                </h5>
                                <small className="text-muted">Cancelled</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : currentItems.length === 0 ? (
                    <div className="text-center py-5">
                        <Icon icon="mdi:folder-open-outline" width="64" className="text-muted mb-3" />
                        <h5 className="text-muted">No order history entries found</h5>
                        <p className="text-muted">Try adjusting your filters or add a new entry</p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Status</th>
                                        <th>Comment</th>
                                        <th>Updated By</th>
                                        <th>Created At</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((entry) => (
                                        <tr key={entry._id}>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {entry.orderId?.toString().slice(-8) || 'N/A'}
                                                </span>
                                            </td>
                                            <td>{getStatusBadge(entry.status)}</td>
                                            <td>
                                                <div style={{ maxWidth: '300px' }}>
                                                    {entry.comment || (
                                                        <span className="text-muted">No comment</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {entry.updatedBy ? (
                                                    <span className="badge bg-info">
                                                        <Icon icon="mdi:account" width="14" className="me-1" />
                                                        {entry.updatedBy?.name || entry.updatedBy}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">System</span>
                                                )}
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {formatDate(entry.createdAt)}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-sm btn-info"
                                                        onClick={() => navigate(`/view-order-history/${entry._id}`)}
                                                        title="View"
                                                    >
                                                        <Icon icon="mdi:eye" width="16" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-primary"
                                                        onClick={() => navigate(`/edit-order-history/${entry._id}`)}
                                                        title="Edit"
                                                    >
                                                        <Icon icon="mdi:pencil" width="16" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(entry._id)}
                                                        title="Delete"
                                                    >
                                                        <Icon icon="mdi:delete" width="16" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <div className="text-muted">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEntries.length)} of {filteredEntries.length} entries
                                </div>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <Icon icon="mdi:chevron-left" width="18" />
                                            </button>
                                        </li>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => paginate(index + 1)}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                <Icon icon="mdi:chevron-right" width="18" />
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryListLayer;
