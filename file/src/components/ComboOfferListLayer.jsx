import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ComboOfferListLayer = () => {
    const [comboOffers, setComboOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchComboOffers();
        fetchProducts();
    }, []);

    useEffect(() => {
        filterOffers();
    }, [comboOffers, filterStatus, searchTerm]);

    const fetchComboOffers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/combo-offers');
            setComboOffers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching combo offers:', error);
            toast.error('Failed to fetch combo offers');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            const productsData = Array.isArray(response.data) ? response.data : response.data.data || [];
            setProducts(productsData);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const filterOffers = () => {
        let filtered = [...comboOffers];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(offer => offer.status === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(offer =>
                offer.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOffers(filtered);
    };

    const getProductName = (product) => {
        if (product && typeof product === 'object') {
            return product.title || product.name || 'Unknown Product';
        }
        if (typeof product === 'string') {
            const foundProduct = products.find(p => p._id === product);
            return foundProduct ? (foundProduct.title || foundProduct.name) : 'Unknown Product';
        }
        return 'Unknown Product';
    };

    const calculateTotalPrice = (items) => {
        if (!items || items.length === 0) return 0;
        return items.reduce((total, item) => {
            const product = typeof item.productId === 'object' ? item.productId :
                products.find(p => p._id === item.productId);
            const price = product?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    };

    const calculateSavings = (offer) => {
        const totalPrice = calculateTotalPrice(offer.items);
        const savings = totalPrice - offer.comboPrice;
        const savingsPercent = totalPrice > 0 ? ((savings / totalPrice) * 100).toFixed(0) : 0;
        return { savings, savingsPercent };
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const offer = comboOffers.find(o => o._id === id);
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            await api.put(`/admin/combo-offers/${id}`, {
                ...offer,
                status: newStatus
            });

            toast.success(`Combo offer ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            fetchComboOffers();
        } catch (error) {
            console.error('Error updating combo offer:', error);
            toast.error('Failed to update combo offer status');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/admin/combo-offers/${deleteId}`);
            toast.success('Combo offer deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchComboOffers();
        } catch (error) {
            console.error('Error deleting combo offer:', error);
            toast.error('Failed to delete combo offer');
        }
    };

    const getStats = () => {
        const total = comboOffers.length;
        const active = comboOffers.filter(offer => offer.status === 'active').length;
        const inactive = comboOffers.filter(offer => offer.status === 'inactive').length;

        return { total, active, inactive };
    };

    const stats = getStats();

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
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-4 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:package-variant" width="28" className="text-primary" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Total Combos</p>
                                    <h5 className="mb-0 fw-bold">{stats.total}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:check-circle" width="28" className="text-success" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Active</p>
                                    <h5 className="mb-0 fw-bold">{stats.active}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:close-circle" width="28" className="text-secondary" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Inactive</p>
                                    <h5 className="mb-0 fw-bold">{stats.inactive}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <Icon icon="mdi:package-variant" className="me-2" />
                        Combo Offers
                    </h5>
                    <Link to="/add-combo-offer" className="btn btn-primary btn-sm">
                        <Icon icon="mdi:plus" className="me-1" />
                        Add Combo Offer
                    </Link>
                </div>
                <div className="card-body">
                    {/* Filters */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label small">Status</label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-8">
                            <label className="form-label small">Search</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <Icon icon="mdi:magnify" />
                                </span>
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

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Products</th>
                                    <th>Pricing</th>
                                    <th>Validity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <Icon icon="mdi:package-variant-closed" width="48" className="text-muted mb-2" />
                                            <p className="text-muted mb-0">No combo offers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOffers.map((offer, index) => {
                                        const { savings, savingsPercent } = calculateSavings(offer);
                                        return (
                                            <tr key={offer._id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                backgroundColor: '#e3f2fd'
                                                            }}
                                                        >
                                                            <Icon icon="mdi:package-variant" className="text-primary" />
                                                        </div>
                                                        <span className="fw-semibold">{offer.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {offer.items?.slice(0, 2).map((item, idx) => (
                                                            <span key={idx} className="badge bg-light text-dark border">
                                                                {item.quantity}x {getProductName(item.productId)}
                                                            </span>
                                                        ))}
                                                        {offer.items?.length > 2 && (
                                                            <span className="badge bg-secondary">
                                                                +{offer.items.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">
                                                        {offer.items?.length || 0} product(s) in combo
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <div className="fw-bold text-success">₹{offer.comboPrice}</div>
                                                        {savings > 0 && (
                                                            <>
                                                                <div className="text-muted text-decoration-line-through">
                                                                    ₹{calculateTotalPrice(offer.items).toFixed(2)}
                                                                </div>
                                                                <div className="badge bg-success-subtle text-success">
                                                                    Save {savingsPercent}%
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        {offer.startDate && (
                                                            <div className="d-flex align-items-center mb-1">
                                                                <Icon icon="mdi:calendar-start" className="me-1" width="16" />
                                                                <span>{new Date(offer.startDate).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        {offer.endDate && (
                                                            <div className="d-flex align-items-center text-muted">
                                                                <Icon icon="mdi:calendar-end" className="me-1" width="16" />
                                                                <span>{new Date(offer.endDate).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                        {!offer.startDate && !offer.endDate && (
                                                            <span className="text-muted">Always available</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column gap-2">
                                                        <span
                                                            className={`badge ${offer.status === 'active' ? 'bg-success' : 'bg-secondary'
                                                                }`}
                                                        >
                                                            {offer.status === 'active' && <Icon icon="mdi:check-circle" className="me-1" />}
                                                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                                                        </span>
                                                        <div className="form-check form-switch">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                role="switch"
                                                                checked={offer.status === 'active'}
                                                                onChange={() => handleToggleStatus(offer._id, offer.status)}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <Link
                                                            to={`/edit-combo-offer/${offer._id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                        >
                                                            <Icon icon="mdi:pencil" />
                                                        </Link>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteClick(offer._id)}
                                                            title="Delete"
                                                        >
                                                            <Icon icon="mdi:delete" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                                <p>Are you sure you want to delete this combo offer?</p>
                                <p className="text-danger mb-0">This action cannot be undone.</p>
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

export default ComboOfferListLayer;
