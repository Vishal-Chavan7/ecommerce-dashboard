import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AutoDiscountListLayer = () => {
    const navigate = useNavigate();
    const [autoDiscounts, setAutoDiscounts] = useState([]);
    const [filteredDiscounts, setFilteredDiscounts] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, flat, percent
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, expired, upcoming
    const [filterApplicableTo, setFilterApplicableTo] = useState('all'); // all, product, category, brand, all
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchAutoDiscounts();
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    useEffect(() => {
        filterDiscounts();
    }, [autoDiscounts, filterType, filterStatus, filterApplicableTo, searchTerm]);

    const fetchAutoDiscounts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/auto-discounts');
            setAutoDiscounts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching auto discounts:', error);
            toast.error('Failed to fetch auto discounts');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const getDiscountStatus = (discount) => {
        const now = new Date();
        const start = discount.startDate ? new Date(discount.startDate) : null;
        const end = discount.endDate ? new Date(discount.endDate) : null;

        if (discount.status === 'inactive') return 'inactive';
        if (start && now < start) return 'upcoming';
        if (end && now > end) return 'expired';
        return 'active';
    };

    const filterDiscounts = () => {
        let filtered = [...autoDiscounts];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(d => d.discountType === filterType);
        }

        // Filter by applicable to
        if (filterApplicableTo !== 'all') {
            filtered = filtered.filter(d => d.applicableTo?.type === filterApplicableTo);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(d => getDiscountStatus(d) === filterStatus);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(d =>
                d.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredDiscounts(filtered);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.put(`/admin/auto-discounts/${id}`, { status: newStatus });
            toast.success(`Auto discount ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            fetchAutoDiscounts();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/admin/auto-discounts/${deleteId}`);
            toast.success('Auto discount deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchAutoDiscounts();
        } catch (error) {
            console.error('Error deleting auto discount:', error);
            toast.error('Failed to delete auto discount');
        }
    };

    const getStats = () => {
        return {
            total: autoDiscounts.length,
            active: autoDiscounts.filter(d => getDiscountStatus(d) === 'active').length,
            inactive: autoDiscounts.filter(d => d.status === 'inactive').length,
            expired: autoDiscounts.filter(d => getDiscountStatus(d) === 'expired').length,
            upcoming: autoDiscounts.filter(d => getDiscountStatus(d) === 'upcoming').length,
        };
    };

    const stats = getStats();

    const getStatusBadge = (discount) => {
        const status = getDiscountStatus(discount);
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

    const getApplicableItems = (discount) => {
        if (discount.applicableTo?.type === 'all') {
            return <span className="badge bg-primary">Store-wide</span>;
        }

        const type = discount.applicableTo?.type;
        const ids = discount.applicableTo?.ids || [];

        if (ids.length === 0) return <span className="text-muted">None</span>;

        let items = [];
        if (type === 'product') {
            items = products.filter(p => ids.includes(p._id));
        } else if (type === 'category') {
            items = categories.filter(c => ids.includes(c._id));
        } else if (type === 'brand') {
            items = brands.filter(b => ids.includes(b._id));
        }

        if (items.length === 0) return <span className="text-muted">{ids.length} items</span>;

        return (
            <div className="d-flex flex-wrap gap-1">
                {items.slice(0, 3).map((item, index) => (
                    <span key={index} className="badge bg-light text-dark border">
                        {item.name || item.title}
                    </span>
                ))}
                {items.length > 3 && (
                    <span className="badge bg-light text-dark border">
                        +{items.length - 3} more
                    </span>
                )}
            </div>
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
                        <Icon icon="mdi:sale" className="me-2" />
                        Auto Discount Management
                    </h4>
                    <p className="text-muted mb-0">Automatically apply discounts when cart conditions are met</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/add-auto-discount')}
                >
                    <Icon icon="mdi:plus" className="me-1" />
                    Create Auto Discount
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:sale" width="28" className="text-primary" />
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

                <div className="col-xl-3 col-lg-6 col-md-6">
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

                <div className="col-xl-3 col-lg-6 col-md-6">
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
                                Discount Type
                            </label>
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="flat">Flat Amount</option>
                                <option value="percent">Percentage</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:tag" className="me-1" />
                                Applicable To
                            </label>
                            <select
                                className="form-select"
                                value={filterApplicableTo}
                                onChange={(e) => setFilterApplicableTo(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="product">Products</option>
                                <option value="category">Categories</option>
                                <option value="brand">Brands</option>
                                <option value="all">Store-wide</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:clock-check" className="me-1" />
                                Status
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

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:magnify" className="me-1" />
                                Search
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by title..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto Discounts Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '5%' }}>
                                        <Icon icon="mdi:pound" width="18" />
                                    </th>
                                    <th style={{ width: '20%' }}>
                                        <Icon icon="mdi:format-title" width="18" className="me-1" />
                                        Title
                                    </th>
                                    <th style={{ width: '12%' }}>
                                        <Icon icon="mdi:sale" width="18" className="me-1" />
                                        Discount
                                    </th>
                                    <th style={{ width: '12%' }}>
                                        <Icon icon="mdi:cart" width="18" className="me-1" />
                                        Min Cart
                                    </th>
                                    <th style={{ width: '15%' }}>
                                        <Icon icon="mdi:tag" width="18" className="me-1" />
                                        Applicable To
                                    </th>
                                    <th style={{ width: '8%' }}>
                                        <Icon icon="mdi:sort-numeric-ascending" width="18" className="me-1" />
                                        Priority
                                    </th>
                                    <th style={{ width: '10%' }}>
                                        <Icon icon="mdi:calendar-range" width="18" className="me-1" />
                                        Validity
                                    </th>
                                    <th style={{ width: '10%' }}>
                                        <Icon icon="mdi:information" width="18" className="me-1" />
                                        Status
                                    </th>
                                    <th style={{ width: '8%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDiscounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            <Icon icon="mdi:sale-off" width="48" className="text-muted mb-2" />
                                            <p className="text-muted mb-0">No auto discounts found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDiscounts.map((discount, index) => (
                                        <tr key={discount._id}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            backgroundColor: discount.discountType === 'percent' ? '#e3f2fd' : '#fff3e0'
                                                        }}
                                                    >
                                                        <Icon
                                                            icon={discount.discountType === 'percent' ? 'mdi:percent' : 'mdi:currency-inr'}
                                                            width="20"
                                                            className={discount.discountType === 'percent' ? 'text-info' : 'text-warning'}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{discount.title}</div>
                                                        <small className="text-muted">
                                                            <Icon icon="mdi:tag" width="12" className="me-1" />
                                                            {discount.applicableTo?.type || 'all'}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge fs-6 ${discount.discountType === 'percent' ? 'bg-info' : 'bg-warning'
                                                        }`}
                                                >
                                                    {discount.discountType === 'percent' ? (
                                                        <>
                                                            <Icon icon="mdi:percent" width="16" className="me-1" />
                                                            {discount.value}%
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Icon icon="mdi:currency-inr" width="16" className="me-1" />
                                                            ₹{discount.value}
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                {discount.minCartValue ? (
                                                    <span className="badge bg-light text-dark border">
                                                        ₹{discount.minCartValue}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">No minimum</span>
                                                )}
                                            </td>
                                            <td>{getApplicableItems(discount)}</td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    #{discount.priority}
                                                </span>
                                            </td>
                                            <td>
                                                {discount.startDate || discount.endDate ? (
                                                    <div className="small">
                                                        {discount.startDate && (
                                                            <div>
                                                                <Icon icon="mdi:calendar-start" width="12" className="me-1 text-success" />
                                                                {new Date(discount.startDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {discount.endDate && (
                                                            <div>
                                                                <Icon icon="mdi:calendar-end" width="12" className="me-1 text-danger" />
                                                                {new Date(discount.endDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">No expiry</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {getStatusBadge(discount)}
                                                    <div className="form-check form-switch mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={discount.status === 'active'}
                                                            onChange={() => handleToggleStatus(discount._id, discount.status)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/edit-auto-discount/${discount._id}`)}
                                                        title="Edit"
                                                    >
                                                        <Icon icon="mdi:pencil" width="16" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteClick(discount._id)}
                                                        title="Delete"
                                                    >
                                                        <Icon icon="mdi:delete" width="16" />
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
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this auto discount? This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
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
                                    onClick={handleDeleteConfirm}
                                >
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

export default AutoDiscountListLayer;
