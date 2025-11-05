import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const BuyXGetYListLayer = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive, expired, upcoming
    const [filterDiscountType, setFilterDiscountType] = useState('all'); // all, free, percent, flat
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchOffers();
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterOffersList();
    }, [offers, filterStatus, filterDiscountType, searchTerm]);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/buy-x-get-y');
            setOffers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to fetch Buy X Get Y offers');
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

    const getOfferStatus = (offer) => {
        const now = new Date();
        const start = offer.startDate ? new Date(offer.startDate) : null;
        const end = offer.endDate ? new Date(offer.endDate) : null;

        if (offer.status === 'inactive') return 'inactive';
        if (start && now < start) return 'upcoming';
        if (end && now > end) return 'expired';
        return 'active';
    };

    const filterOffersList = () => {
        let filtered = [...offers];

        // Filter by discount type
        if (filterDiscountType !== 'all') {
            filtered = filtered.filter(o => o.get?.discountType === filterDiscountType);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(o => getOfferStatus(o) === filterStatus);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(o =>
                o.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOffers(filtered);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.put(`/admin/buy-x-get-y/${id}`, { status: newStatus });
            toast.success(`Offer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            fetchOffers();
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
            await api.delete(`/admin/buy-x-get-y/${deleteId}`);
            toast.success('Offer deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchOffers();
        } catch (error) {
            console.error('Error deleting offer:', error);
            toast.error('Failed to delete offer');
        }
    };

    const getStats = () => {
        return {
            total: offers.length,
            active: offers.filter(o => getOfferStatus(o) === 'active').length,
            inactive: offers.filter(o => o.status === 'inactive').length,
            expired: offers.filter(o => getOfferStatus(o) === 'expired').length,
            upcoming: offers.filter(o => getOfferStatus(o) === 'upcoming').length,
        };
    };

    const stats = getStats();

    const getStatusBadge = (offer) => {
        const status = getOfferStatus(offer);
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

    const getProductNames = (productIds) => {
        if (!productIds || productIds.length === 0) return <span className="text-muted">Any</span>;
        const names = products.filter(p => productIds.includes(p._id)).map(p => p.name);
        if (names.length === 0) return <span className="text-muted">{productIds.length} items</span>;

        return (
            <div className="d-flex flex-wrap gap-1">
                {names.slice(0, 2).map((name, index) => (
                    <span key={index} className="badge bg-light text-dark border">
                        {name}
                    </span>
                ))}
                {names.length > 2 && (
                    <span className="badge bg-light text-dark border">
                        +{names.length - 2} more
                    </span>
                )}
            </div>
        );
    };

    const getCategoryNames = (categoryIds) => {
        if (!categoryIds || categoryIds.length === 0) return null;
        const names = categories.filter(c => categoryIds.includes(c._id)).map(c => c.name);
        if (names.length === 0) return null;

        return (
            <div className="d-flex flex-wrap gap-1 mt-1">
                {names.slice(0, 2).map((name, index) => (
                    <span key={index} className="badge bg-info text-white">
                        {name}
                    </span>
                ))}
                {names.length > 2 && (
                    <span className="badge bg-info text-white">
                        +{names.length - 2} more
                    </span>
                )}
            </div>
        );
    };

    const getDiscountBadge = (getInfo) => {
        if (getInfo.discountType === 'free') {
            return <span className="badge bg-success fs-6">FREE</span>;
        } else if (getInfo.discountType === 'percent') {
            return (
                <span className="badge bg-info fs-6">
                    <Icon icon="mdi:percent" width="16" className="me-1" />
                    {getInfo.value}% OFF
                </span>
            );
        } else {
            return (
                <span className="badge bg-warning fs-6">
                    <Icon icon="mdi:currency-inr" width="16" className="me-1" />
                    ₹{getInfo.value} OFF
                </span>
            );
        }
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
                        <Icon icon="mdi:gift" className="me-2" />
                        Buy X Get Y Offers
                    </h4>
                    <p className="text-muted mb-0">Manage "Buy X Get Y" promotional offers</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/add-buy-x-get-y')}
                >
                    <Icon icon="mdi:plus" className="me-1" />
                    Create Offer
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:gift" width="28" className="text-primary" />
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
                        <div className="col-md-4">
                            <label className="form-label small">
                                <Icon icon="mdi:gift-outline" className="me-1" />
                                Discount Type
                            </label>
                            <select
                                className="form-select"
                                value={filterDiscountType}
                                onChange={(e) => setFilterDiscountType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="free">Free</option>
                                <option value="percent">Percentage Off</option>
                                <option value="flat">Flat Amount Off</option>
                            </select>
                        </div>

                        <div className="col-md-4">
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

                        <div className="col-md-4">
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

            {/* Offers Table */}
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
                                    <th style={{ width: '20%' }}>
                                        <Icon icon="mdi:cart" width="18" className="me-1" />
                                        Buy Condition
                                    </th>
                                    <th style={{ width: '20%' }}>
                                        <Icon icon="mdi:gift" width="18" className="me-1" />
                                        Get Reward
                                    </th>
                                    <th style={{ width: '13%' }}>
                                        <Icon icon="mdi:calendar-range" width="18" className="me-1" />
                                        Validity
                                    </th>
                                    <th style={{ width: '10%' }}>
                                        <Icon icon="mdi:information" width="18" className="me-1" />
                                        Status
                                    </th>
                                    <th style={{ width: '12%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <Icon icon="mdi:gift-off" width="48" className="text-muted mb-2" />
                                            <p className="text-muted mb-0">No Buy X Get Y offers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOffers.map((offer, index) => (
                                        <tr key={offer._id}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            backgroundColor: '#e8f5e9'
                                                        }}
                                                    >
                                                        <Icon icon="mdi:gift" width="20" className="text-success" />
                                                    </div>
                                                    <div className="fw-semibold">{offer.title}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="mb-1">
                                                        <span className="badge bg-primary me-1">
                                                            Buy {offer.buy?.quantity || 0}
                                                        </span>
                                                    </div>
                                                    {getProductNames(offer.buy?.products)}
                                                    {getCategoryNames(offer.buy?.categories)}
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="mb-1">
                                                        <span className="badge bg-secondary me-1">
                                                            Get {offer.get?.quantity || 0}
                                                        </span>
                                                        {getDiscountBadge(offer.get)}
                                                    </div>
                                                    {getProductNames(offer.get?.products)}
                                                </div>
                                            </td>
                                            <td>
                                                {offer.startDate || offer.endDate ? (
                                                    <div className="small">
                                                        {offer.startDate && (
                                                            <div>
                                                                <Icon icon="mdi:calendar-start" width="12" className="me-1 text-success" />
                                                                {new Date(offer.startDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {offer.endDate && (
                                                            <div>
                                                                <Icon icon="mdi:calendar-end" width="12" className="me-1 text-danger" />
                                                                {new Date(offer.endDate).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">No expiry</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {getStatusBadge(offer)}
                                                    <div className="form-check form-switch mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={offer.status === 'active'}
                                                            onChange={() => handleToggleStatus(offer._id, offer.status)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/edit-buy-x-get-y/${offer._id}`)}
                                                        title="Edit"
                                                    >
                                                        <Icon icon="mdi:pencil" width="16" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteClick(offer._id)}
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
                                <p>Are you sure you want to delete this Buy X Get Y offer? This action cannot be undone.</p>
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

export default BuyXGetYListLayer;
