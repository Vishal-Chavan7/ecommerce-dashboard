import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TierPricingListLayer = () => {
    const [tierPricingList, setTierPricingList] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedVariant, setSelectedVariant] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchVariants();
    }, []);

    useEffect(() => {
        fetchTierPricingList();
    }, [selectedProduct, selectedVariant]);

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

    const fetchTierPricingList = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProduct) params.productId = selectedProduct;

            const response = await api.get('/admin/pricing/tier', { params });
            const tierData = response.data || [];

            // Populate product and variant data
            const tierWithDetails = tierData.map(tier => {
                const product = products.find(p => p._id === tier.productId);
                const variant = tier.variantId ? variants.find(v => v._id === tier.variantId) : null;
                return {
                    ...tier,
                    productName: product ? product.title : 'Unknown Product',
                    variantSKU: variant ? variant.sku : null,
                    variantDetails: variant ? `${variant.color || ''} ${variant.size || ''}`.trim() : null
                };
            });

            // Apply variant filter if selected
            const filteredTiers = selectedVariant
                ? tierWithDetails.filter(t => t.variantId === selectedVariant)
                : tierWithDetails;

            // Apply search filter
            const searchFiltered = searchTerm
                ? filteredTiers.filter(tier =>
                    tier.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (tier.variantSKU && tier.variantSKU.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                : filteredTiers;

            // Sort by product name, then minQty
            searchFiltered.sort((a, b) => {
                if (a.productName !== b.productName) {
                    return a.productName.localeCompare(b.productName);
                }
                return a.minQty - b.minQty;
            });

            setTierPricingList(searchFiltered);
        } catch (error) {
            console.error('Error fetching tier pricing data:', error);
            toast.error('Failed to load tier pricing data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/pricing/tier/${deleteId}`);
            toast.success('Tier pricing deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchTierPricingList();
        } catch (error) {
            console.error('Error deleting tier pricing:', error);
            toast.error('Failed to delete tier pricing');
        }
    };

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const getQuantityRangeText = (minQty, maxQty) => {
        if (!maxQty || maxQty === 999999) {
            return `${minQty}+ units`;
        }
        return `${minQty}-${maxQty} units`;
    };

    const getDiscountBadgeVariant = (minQty) => {
        if (minQty >= 100) return 'danger';
        if (minQty >= 50) return 'warning';
        if (minQty >= 10) return 'info';
        return 'primary';
    };

    return (
        <div className="container-fluid">
            {/* Header Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h2 className="mb-2 d-flex align-items-center" style={{ fontSize: '28px' }}>
                                <Icon icon="mdi:chart-box-multiple" className="me-2" style={{ fontSize: '32px' }} />
                                Tier Pricing Management
                            </h2>
                            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                Manage bulk pricing and wholesale rates based on quantity slabs
                            </p>
                        </div>
                        <button
                            className="btn btn-primary d-flex align-items-center px-4 py-2"
                            onClick={() => navigate('/add-tier-pricing')}
                            style={{ fontSize: '15px' }}
                        >
                            <Icon icon="mdi:plus-circle" className="me-2" style={{ fontSize: '20px' }} />
                            Add Tier Pricing
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>
                                        <Icon icon="solar:box-bold-duotone" className="me-2" style={{ fontSize: '18px' }} />
                                        Filter by Product
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedProduct}
                                        onChange={(e) => {
                                            setSelectedProduct(e.target.value);
                                            setSelectedVariant(''); // Reset variant when product changes
                                        }}
                                        style={{ minWidth: '150px', fontSize: '14px', padding: '10px 12px' }}
                                    >
                                        <option value="">All Products</option>
                                        {products.map(product => (
                                            <option key={product._id} value={product._id}>
                                                {product.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>
                                        <Icon icon="mdi:palette" className="me-2" style={{ fontSize: '18px' }} />
                                        Filter by Variant
                                    </label>
                                    <select
                                        className="form-select"
                                        value={selectedVariant}
                                        onChange={(e) => setSelectedVariant(e.target.value)}
                                        disabled={!selectedProduct}
                                        style={{ minWidth: '150px', fontSize: '14px', padding: '10px 12px' }}
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

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>
                                        <Icon icon="mdi:magnify" className="me-2" style={{ fontSize: '18px' }} />
                                        Search
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by product or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ minWidth: '200px', fontSize: '14px', padding: '10px 12px' }}
                                    />
                                </div>
                            </div>

                            {(selectedProduct || selectedVariant || searchTerm) && (
                                <div className="mt-3">
                                    <button
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                        onClick={() => {
                                            setSelectedProduct('');
                                            setSelectedVariant('');
                                            setSearchTerm('');
                                        }}
                                        style={{ fontSize: '13px' }}
                                    >
                                        <Icon icon="mdi:filter-remove" className="me-2" style={{ fontSize: '16px' }} />
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
                <div className="col-md-4">
                    <div className="card shadow-sm border-primary">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:chart-line" style={{ fontSize: '40px', color: '#0d6efd' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1" style={{ fontSize: '13px' }}>Total Tier Rules</h6>
                                    <h3 className="mb-0" style={{ fontSize: '26px' }}>{tierPricingList.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-success">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="solar:box-bold-duotone" style={{ fontSize: '40px', color: '#198754' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1" style={{ fontSize: '13px' }}>Products with Tiers</h6>
                                    <h3 className="mb-0" style={{ fontSize: '26px' }}>
                                        {new Set(tierPricingList.map(t => t.productId)).size}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card shadow-sm border-info">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:package-variant" style={{ fontSize: '40px', color: '#0dcaf0' }} />
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1" style={{ fontSize: '13px' }}>Variant Tiers</h6>
                                    <h3 className="mb-0" style={{ fontSize: '26px' }}>
                                        {tierPricingList.filter(t => t.variantId).length}
                                    </h3>
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
                                <h5 className="mb-0 d-flex align-items-center" style={{ fontSize: '18px' }}>
                                    Tier Pricing List
                                    <span className="badge bg-primary ms-2" style={{ fontSize: '13px' }}>{tierPricingList.length}</span>
                                </h5>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-2 text-muted" style={{ fontSize: '14px' }}>Loading tier pricing data...</p>
                                </div>
                            ) : tierPricingList.length === 0 ? (
                                <div className="text-center py-5">
                                    <Icon icon="mdi:chart-box-multiple-outline" style={{ fontSize: '64px', color: '#ccc' }} />
                                    <h5 className="mt-3 text-muted" style={{ fontSize: '18px' }}>No Tier Pricing Found</h5>
                                    <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                                        Start by creating your first tier pricing rule for bulk orders
                                    </p>
                                    <button
                                        className="btn btn-primary d-flex align-items-center px-4 py-2 mx-auto"
                                        onClick={() => navigate('/add-tier-pricing')}
                                        style={{ fontSize: '15px' }}
                                    >
                                        <Icon icon="mdi:plus-circle" className="me-2" style={{ fontSize: '18px' }} />
                                        Add First Tier Pricing
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr style={{ fontSize: '14px' }}>
                                                <th className="fw-semibold">Product</th>
                                                <th className="fw-semibold">Variant</th>
                                                <th className="fw-semibold">Quantity Range</th>
                                                <th className="fw-semibold">Min Qty</th>
                                                <th className="fw-semibold">Max Qty</th>
                                                <th className="fw-semibold">Tier Price</th>
                                                <th className="text-center fw-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ fontSize: '14px' }}>
                                            {tierPricingList.map((tier) => (
                                                <tr key={tier._id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Icon icon="solar:box-bold-duotone" className="me-2" style={{ fontSize: '24px', color: '#0d6efd' }} />
                                                            <div>
                                                                <div className="fw-semibold" style={{ fontSize: '14px' }}>{tier.productName}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {tier.variantSKU ? (
                                                            <div>
                                                                <span className="badge bg-info" style={{ fontSize: '12px' }}>
                                                                    {tier.variantSKU}
                                                                </span>
                                                                {tier.variantDetails && (
                                                                    <div className="small text-muted mt-1" style={{ fontSize: '12px' }}>
                                                                        {tier.variantDetails}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge bg-${getDiscountBadgeVariant(tier.minQty)}`} style={{ fontSize: '12px' }}>
                                                            <Icon icon="mdi:package-variant" className="me-1" />
                                                            {getQuantityRangeText(tier.minQty, tier.maxQty)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border" style={{ fontSize: '13px' }}>
                                                            {tier.minQty}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border" style={{ fontSize: '13px' }}>
                                                            {tier.maxQty && tier.maxQty < 999999 ? tier.maxQty : '∞'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <Icon icon="mdi:currency-inr" className="me-2" style={{ fontSize: '18px', color: '#198754' }} />
                                                            <span className="fw-bold text-success" style={{ fontSize: '16px' }}>
                                                                {tier.price.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary d-flex align-items-center px-3 py-2"
                                                                onClick={() => navigate(`/edit-tier-pricing/${tier._id}`)}
                                                                title="Edit"
                                                                style={{ fontSize: '13px' }}
                                                            >
                                                                <Icon icon="mdi:pencil" className="me-1" style={{ fontSize: '16px' }} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger d-flex align-items-center px-3 py-2"
                                                                onClick={() => openDeleteModal(tier._id)}
                                                                title="Delete"
                                                                style={{ fontSize: '13px' }}
                                                            >
                                                                <Icon icon="mdi:delete" className="me-1" style={{ fontSize: '16px' }} />
                                                                Delete
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
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title" style={{ fontSize: '18px' }}>Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <Icon icon="mdi:alert-circle" style={{ fontSize: '64px', color: '#dc3545' }} />
                                <h5 className="mt-3" style={{ fontSize: '18px' }}>Are you sure?</h5>
                                <p className="text-muted" style={{ fontSize: '14px' }}>
                                    This will permanently delete this tier pricing rule. This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer border-0 justify-content-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary d-flex align-items-center px-4 py-2"
                                    onClick={() => setShowDeleteModal(false)}
                                    style={{ fontSize: '14px' }}
                                >
                                    <Icon icon="mdi:close" className="me-2" style={{ fontSize: '18px' }} />
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger d-flex align-items-center px-4 py-2"
                                    onClick={handleDelete}
                                    style={{ fontSize: '14px' }}
                                >
                                    <Icon icon="mdi:delete" className="me-2" style={{ fontSize: '18px' }} />
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

export default TierPricingListLayer;
