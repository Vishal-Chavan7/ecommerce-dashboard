import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CouponListLayer = () => {
    const [coupons, setCoupons] = useState([]);
    const [filteredCoupons, setFilteredCoupons] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, flat, percent
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, expired, upcoming
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCoupons();
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [coupons, filterType, filterStatus, searchTerm]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/coupons');
            setCoupons(response.data.data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const getCouponStatus = (coupon) => {
        const now = new Date();
        const start = coupon.startDate ? new Date(coupon.startDate) : null;
        const end = coupon.endDate ? new Date(coupon.endDate) : null;

        if (coupon.status === 'inactive') return 'inactive';
        if (start && now < start) return 'upcoming';
        if (end && now > end) return 'expired';
        return 'active';
    };

    const applyFilters = () => {
        let filtered = [...coupons];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(coupon => coupon.type === filterType);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(coupon => getCouponStatus(coupon) === filterStatus);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(coupon =>
                coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCoupons(filtered);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.put(`/admin/coupons/${id}`, { status: newStatus });
            toast.success('Coupon status updated successfully');
            fetchCoupons();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/coupons/${deleteId}`);
            toast.success('Coupon deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            toast.error('Failed to delete coupon');
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Coupon code "${code}" copied to clipboard!`);
    };

    const getStats = () => {
        const now = new Date();
        return {
            total: coupons.length,
            active: coupons.filter(c => getCouponStatus(c) === 'active').length,
            inactive: coupons.filter(c => c.status === 'inactive').length,
            expired: coupons.filter(c => getCouponStatus(c) === 'expired').length,
            upcoming: coupons.filter(c => getCouponStatus(c) === 'upcoming').length,
        };
    };

    const stats = getStats();

    const getStatusBadge = (coupon) => {
        const status = getCouponStatus(coupon);
        const badges = {
            active: { bg: 'success', icon: 'mdi:check-circle', text: 'Active' },
            inactive: { bg: 'secondary', icon: 'mdi:pause-circle', text: 'Inactive' },
            expired: { bg: 'danger', icon: 'mdi:close-circle', text: 'Expired' },
            upcoming: { bg: 'info', icon: 'mdi:clock', text: 'Upcoming' }
        };
        const badge = badges[status];
        return (
            <span className={`badge bg-${badge.bg}`}>
                <Icon icon={badge.icon} className="me-1" />
                {badge.text}
            </span>
        );
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
        <div className="container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">
                        <Icon icon="mdi:ticket-percent" className="me-2" />
                        Coupon Management
                    </h4>
                    <p className="text-muted mb-0">Manage discount coupons for your store</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/add-coupon')}
                >
                    <Icon icon="mdi:plus" className="me-1" />
                    Create Coupon
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:ticket-percent" width="28" className="text-primary" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Total</p>
                                    <h5 className="mb-0 fw-bold">{stats.total}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:check-circle" width="28" className="text-success" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Active</p>
                                    <h5 className="mb-0 fw-bold">{stats.active}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:clock" width="28" className="text-info" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Upcoming</p>
                                    <h5 className="mb-0 fw-bold">{stats.upcoming}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:close-circle" width="28" className="text-danger" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Expired</p>
                                    <h5 className="mb-0 fw-bold">{stats.expired}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:pause-circle" width="28" className="text-secondary" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Inactive</p>
                                    <h5 className="mb-0 fw-bold">{stats.inactive}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:filter" className="me-1" />
                                Filter by Type
                            </label>
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="flat">Flat Discount</option>
                                <option value="percent">Percentage</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:toggle-switch" className="me-1" />
                                Filter by Status
                            </label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="expired">Expired</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label small">
                                <Icon icon="mdi:magnify" className="me-1" />
                                Search Coupon Code
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by coupon code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                            Coupons List ({filteredCoupons.length} {filteredCoupons.length === 1 ? 'coupon' : 'coupons'})
                        </h6>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={fetchCoupons}
                        >
                            <Icon icon="mdi:refresh" className="me-1" />
                            Refresh
                        </button>
                    </div>

                    {filteredCoupons.length === 0 ? (
                        <div className="text-center py-5">
                            <Icon icon="mdi:ticket-percent-outline" width="64" className="text-muted mb-3" />
                            <p className="text-muted">No coupons found</p>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate('/add-coupon')}
                            >
                                <Icon icon="mdi:plus" className="me-1" />
                                Create First Coupon
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '20%' }}>
                                            <Icon icon="mdi:ticket" className="me-1" />
                                            Coupon Code
                                        </th>
                                        <th style={{ width: '10%' }}>
                                            <Icon icon="mdi:format-list-bulleted-type" className="me-1" />
                                            Type
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:sale" className="me-1" />
                                            Discount
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:calendar-range" className="me-1" />
                                            Valid Period
                                        </th>
                                        <th style={{ width: '10%' }}>
                                            <Icon icon="mdi:counter" className="me-1" />
                                            Usage Limit
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:information" className="me-1" />
                                            Status
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:toggle-switch" className="me-1" />
                                            Active
                                        </th>
                                        <th className="text-end" style={{ width: '12%' }}>
                                            <Icon icon="mdi:cog" className="me-1" />
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCoupons.map((coupon) => (
                                        <tr key={coupon._id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                                                        <Icon icon="mdi:ticket-percent" width="20" className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <span className="fw-semibold text-dark d-block">{coupon.code}</span>
                                                        <button
                                                            className="btn btn-link btn-sm p-0 text-decoration-none small"
                                                            onClick={() => handleCopyCode(coupon.code)}
                                                        >
                                                            <Icon icon="mdi:content-copy" className="me-1" />
                                                            Copy
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${coupon.type === 'percent' ? 'bg-info' : 'bg-warning text-dark'}`}>
                                                    <Icon icon={coupon.type === 'percent' ? 'mdi:percent' : 'mdi:currency-inr'} className="me-1" />
                                                    {coupon.type === 'percent' ? 'Percent' : 'Flat'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={`badge ${coupon.type === 'percent' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} fs-6 px-3 py-2`}>
                                                    <strong>
                                                        {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}
                                                        {coupon.type === 'percent' && coupon.maxDiscount && (
                                                            <small className="d-block">max ₹{coupon.maxDiscount}</small>
                                                        )}
                                                    </strong>
                                                </div>
                                            </td>
                                            <td>
                                                <small>
                                                    {coupon.startDate && (
                                                        <div>
                                                            <Icon icon="mdi:calendar-start" className="me-1 text-success" />
                                                            {new Date(coupon.startDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {coupon.endDate && (
                                                        <div>
                                                            <Icon icon="mdi:calendar-end" className="me-1 text-danger" />
                                                            {new Date(coupon.endDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {!coupon.startDate && !coupon.endDate && (
                                                        <span className="text-muted">No expiry</span>
                                                    )}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="small">
                                                    {coupon.usageLimit ? (
                                                        <>
                                                            <div>Total: <strong>{coupon.usageLimit}</strong></div>
                                                            {coupon.usagePerUser && (
                                                                <div className="text-muted">Per user: {coupon.usagePerUser}</div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted">Unlimited</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {getStatusBadge(coupon)}
                                            </td>
                                            <td>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={coupon.status === 'active'}
                                                        onChange={() => handleToggleStatus(coupon._id, coupon.status)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/edit-coupon/${coupon._id}`)}
                                                        title="Edit Coupon"
                                                    >
                                                        <Icon icon="mdi:pencil" width="16" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteClick(coupon._id)}
                                                        title="Delete Coupon"
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
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title">
                                    <Icon icon="mdi:alert-circle" className="text-warning me-2" />
                                    Confirm Delete
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">Are you sure you want to delete this coupon? This action cannot be undone.</p>
                                <div className="alert alert-warning mt-3 mb-0">
                                    <Icon icon="mdi:information" className="me-2" />
                                    <small>Users won't be able to use this coupon code anymore.</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                >
                                    <Icon icon="mdi:delete" className="me-1" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponListLayer;
