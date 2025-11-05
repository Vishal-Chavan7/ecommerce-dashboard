import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SpecialPricingListLayer = () => {
    const [specialPricingList, setSpecialPricingList] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [productPricing, setProductPricing] = useState([]); // Add product pricing state
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, expired, upcoming, current
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchVariants();
        fetchProductPricing(); // Fetch product pricing
    }, []);

    useEffect(() => {
        // Only fetch special pricing after products and pricing are loaded
        if (products.length > 0 && productPricing.length > 0) {
            fetchSpecialPricingList();
        }
    }, [selectedProduct, selectedVariant, products, variants, productPricing]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
    };

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants');
            setVariants(response.data || []);
        } catch (error) {
            console.error('Error fetching variants:', error);
        }
    };

    const fetchProductPricing = async () => {
        try {
            const response = await api.get('/admin/pricing');
            setProductPricing(response.data || []);
        } catch (error) {
            console.error('Error fetching product pricing:', error);
            toast.error('Failed to load product pricing');
        }
    };

    const fetchSpecialPricingList = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProduct) params.productId = selectedProduct;

            const response = await api.get('/admin/pricing/special', { params });
            const specialData = response.data || [];

            // Populate product and variant data
            const specialWithDetails = specialData.map(special => {
                const product = products.find(p => p._id === special.productId);
                const variant = special.variantId ? variants.find(v => v._id === special.variantId) : null;

                // Find the product pricing to get regular price
                const pricing = productPricing.find(p => p.productId === special.productId);
                const regularPrice = pricing ? (pricing.finalPrice || pricing.price || 0) : 0;

                const now = new Date();
                const startDate = new Date(special.startDate);
                const endDate = new Date(special.endDate);

                let priceStatus = 'expired';
                if (now < startDate) {
                    priceStatus = 'upcoming';
                } else if (now >= startDate && now <= endDate) {
                    priceStatus = 'current';
                } else {
                    priceStatus = 'expired';
                }

                return {
                    ...special,
                    productName: product ? product.title : 'Unknown Product',
                    regularPrice: regularPrice,
                    variantSKU: variant ? variant.sku : null,
                    variantDetails: variant ? `${variant.color || ''} ${variant.size || ''}`.trim() : null,
                    priceStatus,
                    daysRemaining: priceStatus === 'current' ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0
                };
            });

            // Apply variant filter
            let filteredSpecials = selectedVariant
                ? specialWithDetails.filter(s => s.variantId === selectedVariant)
                : specialWithDetails;

            // Apply status filter
            if (filterStatus === 'active') {
                filteredSpecials = filteredSpecials.filter(s => s.status);
            } else if (filterStatus === 'current') {
                filteredSpecials = filteredSpecials.filter(s => s.priceStatus === 'current');
            } else if (filterStatus === 'upcoming') {
                filteredSpecials = filteredSpecials.filter(s => s.priceStatus === 'upcoming');
            } else if (filterStatus === 'expired') {
                filteredSpecials = filteredSpecials.filter(s => s.priceStatus === 'expired');
            }

            // Apply search filter
            const searchFiltered = searchTerm
                ? filteredSpecials.filter(special =>
                    special.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (special.variantSKU && special.variantSKU.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                : filteredSpecials;

            // Sort by start date (most recent first)
            searchFiltered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

            setSpecialPricingList(searchFiltered);
        } catch (error) {
            console.error('Error fetching special pricing data:', error);
            toast.error('Failed to load special pricing data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/pricing/special/${id}`, { status: !currentStatus });
            toast.success('Status updated successfully');
            fetchSpecialPricingList();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/pricing/special/${deleteId}`);
            toast.success('Special pricing deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchSpecialPricingList();
        } catch (error) {
            console.error('Error deleting special pricing:', error);
            toast.error('Failed to delete special pricing');
        }
    };

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPriceStatusBadge = (status, daysRemaining) => {
        switch (status) {
            case 'current':
                return (
                    <span className="badge bg-success">
                        <Icon icon="mdi:clock-check" className="me-1" />
                        Active {daysRemaining > 0 && `(${daysRemaining}d left)`}
                    </span>
                );
            case 'upcoming':
                return (
                    <span className="badge bg-info">
                        <Icon icon="mdi:clock-outline" className="me-1" />
                        Upcoming
                    </span>
                );
            case 'expired':
                return (
                    <span className="badge bg-secondary">
                        <Icon icon="mdi:clock-end" className="me-1" />
                        Expired
                    </span>
                );
            default:
                return null;
        }
    };

    const getStats = () => {
        const total = specialPricingList.length;
        const current = specialPricingList.filter(s => s.priceStatus === 'current').length;
        const upcoming = specialPricingList.filter(s => s.priceStatus === 'upcoming').length;
        const expired = specialPricingList.filter(s => s.priceStatus === 'expired').length;

        return { total, current, upcoming, expired };
    };

    const stats = getStats();

    return (
        <div className="container-fluid">
            {/* Header Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="mb-2">
                                <Icon icon="mdi:tag-multiple" className="me-2" style={{ fontSize: '32px' }} />
                                Special Pricing Management
                            </h2>
                            <p className="text-muted mb-0">
                                Manage time-based promotional pricing, weekend deals, and festive offers
                            </p>
                        </div>
                        <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={() => navigate('/add-special-pricing')}
                        >
                            <Icon icon="mdi:plus-circle" style={{ fontSize: '20px' }} />
                            Add Special Pricing
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">
                                        <Icon icon="solar:box-bold-duotone" className="me-2" />
                                        Filter by Product
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedProduct}
                                        onChange={(e) => {
                                            setSelectedProduct(e.target.value);
                                            setSelectedVariant('');
                                        }}
                                    >
                                        <option value="">All Products</option>
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">
                                        <Icon icon="mdi:palette" className="me-2" />
                                        Filter by Variant
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedVariant}
                                        onChange={(e) => setSelectedVariant(e.target.value)}
                                        disabled={!selectedProduct}
                                    >
                                        <option value="">All Variants</option>
                                        {variants
                                            .filter(v => !selectedProduct || v.productId === selectedProduct)
                                            .map(variant => (
                                                <option key={variant._id} value={variant._id}>
                                                    {variant.sku} - {variant.color} {variant.size}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">
                                        <Icon icon="mdi:filter" className="me-2" />
                                        Filter by Status
                                    </label>
                                    <select
                                        className="form-select"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="current">Current (Active Now)</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="expired">Expired</option>
                                        <option value="active">Enabled Only</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">
                                        <Icon icon="mdi:magnify" className="me-2" />
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by product or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {(selectedProduct || selectedVariant || filterStatus !== 'all' || searchTerm) && (
                                <div className="mt-3">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => {
                                            setSelectedProduct('');
                                            setSelectedVariant('');
                                            setFilterStatus('all');
                                            setSearchTerm('');
                                        }}
                                    >
                                        <Icon icon="mdi:filter-remove" className="me-1" />
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card shadow-sm border-primary">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:tag-multiple" style={{ fontSize: '40px', color: '#0d6efd' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Total Offers</h6>
                                    <h3 className="mb-0">{stats.total}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-success">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:clock-check" style={{ fontSize: '40px', color: '#198754' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Active Now</h6>
                                    <h3 className="mb-0">{stats.current}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-info">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:clock-outline" style={{ fontSize: '40px', color: '#0dcaf0' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Upcoming</h6>
                                    <h3 className="mb-0">{stats.upcoming}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card shadow-sm border-secondary">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:clock-end" style={{ fontSize: '40px', color: '#6c757d' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Expired</h6>
                                    <h3 className="mb-0">{stats.expired}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    Special Pricing List
                                    <span className="badge bg-primary ms-2">{specialPricingList.length}</span>
                                </h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted">Loading special pricing data...</p>
                                </div>
                            ) : specialPricingList.length === 0 ? (
                                <div className="text-center py-5">
                                    <Icon icon="mdi:tag-multiple-outline" style={{ fontSize: '64px', color: '#ccc' }} />
                                    <h5 className="mt-3 text-muted">No Special Pricing Found</h5>
                                    <p className="text-muted mb-4">
                                        Start by creating your first promotional offer or time-based deal
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/add-special-pricing')}
                                    >
                                        <Icon icon="mdi:plus-circle" className="me-2" />
                                        Add First Special Pricing
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Product</th>
                                                <th>Variant</th>
                                                <th>Regular Price</th>
                                                <th>Special Price</th>
                                                <th>Discount</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Offer Status</th>
                                                <th className="text-center">Status</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {specialPricingList.map((special) => {
                                                const discount = special.regularPrice > 0
                                                    ? (((special.regularPrice - special.specialPrice) / special.regularPrice) * 100).toFixed(0)
                                                    : 0;

                                                return (
                                                    <tr key={special._id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Icon icon="solar:box-bold-duotone" className="me-2" style={{ fontSize: '24px', color: '#0d6efd' }} />
                                                                <div>
                                                                    <div className="fw-semibold">{special.productName}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {special.variantSKU ? (
                                                                <div>
                                                                    <span className="badge bg-info">
                                                                        {special.variantSKU}
                                                                    </span>
                                                                    {special.variantDetails && (
                                                                        <div className="small text-muted mt-1">
                                                                            {special.variantDetails}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="text-muted text-decoration-line-through">
                                                                ₹{(special.regularPrice || 0).toFixed(2)}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <Icon icon="mdi:currency-inr" className="me-1" style={{ fontSize: '18px', color: '#dc3545' }} />
                                                                <span className="fw-bold text-danger" style={{ fontSize: '16px' }}>
                                                                    {(special.specialPrice || 0).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-danger">
                                                                -{discount}%
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small>{formatDate(special.startDate)}</small>
                                                        </td>
                                                        <td>
                                                            <small>{formatDate(special.endDate)}</small>
                                                        </td>
                                                        <td>
                                                            {getPriceStatusBadge(special.priceStatus, special.daysRemaining)}
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="form-check form-switch d-flex justify-content-center">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    checked={special.status}
                                                                    onChange={() => handleToggleStatus(special._id, special.status)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => navigate(`/edit-special-pricing/${special._id}`)}
                                                                    title="Edit"
                                                                >
                                                                    <Icon icon="mdi:pencil" style={{ fontSize: '16px' }} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => openDeleteModal(special._id)}
                                                                    title="Delete"
                                                                >
                                                                    <Icon icon="mdi:delete" style={{ fontSize: '16px' }} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <Icon icon="mdi:alert-circle" style={{ fontSize: '64px', color: '#dc3545' }} />
                                <h5 className="mt-3">Are you sure?</h5>
                                <p className="text-muted">
                                    This will permanently delete this special pricing offer. This action cannot be undone.
                                </p>
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
                                    onClick={handleDelete}
                                >
                                    <Icon icon="mdi:delete" className="me-2" />
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

export default SpecialPricingListLayer;
