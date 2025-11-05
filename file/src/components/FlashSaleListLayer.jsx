import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const FlashSaleListLayer = () => {
    const [flashSales, setFlashSales] = useState([]);
    const [filteredFlashSales, setFilteredFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchFlashSales();
        fetchProducts();
        fetchVariants();
    }, []);

    useEffect(() => {
        filterFlashSales();
    }, [flashSales, filterStatus, searchTerm]);

    const fetchFlashSales = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/flash-sales');
            setFlashSales(response.data.data || []);
        } catch (error) {
            console.error('Error fetching flash sales:', error);
            toast.error('Failed to fetch flash sales');
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

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants');
            setVariants(response.data.data || []);
        } catch (error) {
            console.error('Error fetching variants:', error);
        }
    };

    const getFlashSaleStatus = (flashSale) => {
        const now = new Date();
        const startDate = flashSale.startDate ? new Date(flashSale.startDate) : null;
        const endDate = flashSale.endDate ? new Date(flashSale.endDate) : null;

        if (flashSale.status === 'expired' || (endDate && now > endDate)) {
            return 'expired';
        }
        if (startDate && now < startDate) {
            return 'scheduled';
        }
        if (startDate && endDate && now >= startDate && now <= endDate) {
            return 'running';
        }
        return flashSale.status || 'scheduled';
    };

    const filterFlashSales = () => {
        let filtered = [...flashSales];

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(sale => {
                const status = getFlashSaleStatus(sale);
                return status === filterStatus;
            });
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(sale =>
                sale.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredFlashSales(filtered);
    };

    const getProductName = (product) => {
        // If product is populated object with title or name
        if (product && typeof product === 'object') {
            return product.title || product.name || 'Unknown Product';
        }
        // If product is just an ID, look it up
        if (typeof product === 'string') {
            const foundProduct = products.find(p => p._id === product);
            return foundProduct ? (foundProduct.title || foundProduct.name) : 'Unknown Product';
        }
        return 'Unknown Product';
    };

    const getVariantName = (variant) => {
        if (!variant) return 'Default';
        // If variant is populated object with variantName
        if (variant && typeof variant === 'object' && variant.variantName) {
            return variant.variantName;
        }
        // If variant is just an ID, look it up
        if (typeof variant === 'string') {
            const foundVariant = variants.find(v => v._id === variant);
            return foundVariant ? foundVariant.variantName : 'Unknown Variant';
        }
        return 'Default';
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const flashSale = flashSales.find(sale => sale._id === id);
            const newStatus = currentStatus === 'running' ? 'scheduled' : 'running';

            await api.put(`/admin/flash-sales/${id}`, {
                ...flashSale,
                status: newStatus
            });

            toast.success(`Flash sale ${newStatus === 'running' ? 'activated' : 'deactivated'}`);
            fetchFlashSales();
        } catch (error) {
            console.error('Error updating flash sale:', error);
            toast.error('Failed to update flash sale status');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/admin/flash-sales/${deleteId}`);
            toast.success('Flash sale deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchFlashSales();
        } catch (error) {
            console.error('Error deleting flash sale:', error);
            toast.error('Failed to delete flash sale');
        }
    };

    const getStats = () => {
        const total = flashSales.length;
        const scheduled = flashSales.filter(sale => getFlashSaleStatus(sale) === 'scheduled').length;
        const running = flashSales.filter(sale => getFlashSaleStatus(sale) === 'running').length;
        const expired = flashSales.filter(sale => getFlashSaleStatus(sale) === 'expired').length;

        return { total, scheduled, running, expired };
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
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:flash" width="28" className="text-primary" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Total</p>
                                    <h5 className="mb-0 fw-bold">{stats.total}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:clock-outline" width="28" className="text-info" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Scheduled</p>
                                    <h5 className="mb-0 fw-bold">{stats.scheduled}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:lightning-bolt" width="28" className="text-success" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Running</p>
                                    <h5 className="mb-0 fw-bold">{stats.running}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:clock-alert-outline" width="28" className="text-danger" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Expired</p>
                                    <h5 className="mb-0 fw-bold">{stats.expired}</h5>
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
                        <Icon icon="mdi:flash" className="me-2" />
                        Flash Sales
                    </h5>
                    <Link to="/add-flash-sale" className="btn btn-primary btn-sm">
                        <Icon icon="mdi:plus" className="me-1" />
                        Add Flash Sale
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
                                <option value="scheduled">Scheduled</option>
                                <option value="running">Running</option>
                                <option value="expired">Expired</option>
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
                                    <th>Duration</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFlashSales.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <Icon icon="mdi:flash-off" width="48" className="text-muted mb-2" />
                                            <p className="text-muted mb-0">No flash sales found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFlashSales.map((sale, index) => {
                                        const status = getFlashSaleStatus(sale);
                                        return (
                                            <tr key={sale._id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                backgroundColor: '#fff3cd'
                                                            }}
                                                        >
                                                            <Icon icon="mdi:flash" className="text-warning" />
                                                        </div>
                                                        <span className="fw-semibold">{sale.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {sale.products?.slice(0, 2).map((item, idx) => (
                                                            <span key={idx} className="badge bg-light text-dark border">
                                                                {getProductName(item.productId)}
                                                                {item.variantId && (
                                                                    <small className="text-muted"> • {getVariantName(item.variantId)}</small>
                                                                )}
                                                            </span>
                                                        ))}
                                                        {sale.products?.length > 2 && (
                                                            <span className="badge bg-secondary">
                                                                +{sale.products.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">
                                                        {sale.products?.length || 0} product(s)
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <Icon icon="mdi:calendar-start" className="me-1" width="16" />
                                                            <span>{sale.startDate ? new Date(sale.startDate).toLocaleDateString() : 'Not set'}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center text-muted">
                                                            <Icon icon="mdi:calendar-end" className="me-1" width="16" />
                                                            <span>{sale.endDate ? new Date(sale.endDate).toLocaleDateString() : 'No expiry'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column gap-2">
                                                        <span
                                                            className={`badge ${status === 'running'
                                                                ? 'bg-success'
                                                                : status === 'scheduled'
                                                                    ? 'bg-info'
                                                                    : 'bg-danger'
                                                                }`}
                                                        >
                                                            {status === 'running' && <Icon icon="mdi:lightning-bolt" className="me-1" />}
                                                            {status === 'scheduled' && <Icon icon="mdi:clock-outline" className="me-1" />}
                                                            {status === 'expired' && <Icon icon="mdi:clock-alert-outline" className="me-1" />}
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </span>
                                                        {status !== 'expired' && (
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    checked={status === 'running'}
                                                                    onChange={() => handleToggleStatus(sale._id, status)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <Link
                                                            to={`/edit-flash-sale/${sale._id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Edit"
                                                        >
                                                            <Icon icon="mdi:pencil" />
                                                        </Link>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteClick(sale._id)}
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
                                <p>Are you sure you want to delete this flash sale?</p>
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

export default FlashSaleListLayer;
