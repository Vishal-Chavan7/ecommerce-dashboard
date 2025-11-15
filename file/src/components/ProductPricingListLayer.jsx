import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ProductPricingListLayer = () => {
    const [pricingList, setPricingList] = useState([]);
    const [products, setProducts] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchVariants();
        fetchPricingList();
    }, [selectedProduct]);

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

    const fetchPricingList = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProduct) params.productId = selectedProduct;

            const response = await api.get('/admin/pricing', { params });
            const pricingData = response.data || [];

            // Populate product and variant data
            const pricingWithDetails = pricingData.map(pricing => {
                const product = products.find(p => p._id === pricing.productId);
                const variant = pricing.variantId ? variants.find(v => v._id === pricing.variantId) : null;
                return {
                    ...pricing,
                    productName: product ? product.title : 'Unknown Product',
                    variantSKU: variant ? variant.sku : null
                };
            });

            setPricingList(pricingWithDetails);
        } catch (error) {
            console.error('Error fetching pricing data:', error);
            toast.error('Failed to load pricing data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/pricing/${deleteId}`);
            toast.success('Pricing deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchPricingList();
        } catch (error) {
            console.error('Error deleting pricing:', error);
            toast.error('Failed to delete pricing');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/pricing/${id}`, { status: !currentStatus });
            toast.success('Status updated successfully');
            fetchPricingList();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.title : 'Unknown Product';
    };

    const getVariantSKU = (variantId) => {
        if (!variantId) return null;
        const variant = variants.find(v => v._id === variantId);
        return variant ? variant.sku : 'Unknown SKU';
    };

    const filteredPricingList = pricingList.filter(pricing =>
        getProductName(pricing.productId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pricing.variantSKU && pricing.variantSKU.toLowerCase().includes(searchTerm.toLowerCase())) ||
        pricing.basePrice.toString().includes(searchTerm) ||
        pricing.finalPrice.toString().includes(searchTerm)
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="card-title mb-0">Product Pricing</h5>
                        <span className="badge text-sm fw-semibold text-primary-600 bg-primary-100 px-20 py-9 radius-4">
                            {filteredPricingList.length} {filteredPricingList.length === 1 ? 'Entry' : 'Entries'}
                        </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <select
                            className="form-select form-select-sm p-1"
                            style={{ minWidth: '150px', width: 'auto' }}
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            <option value="">All Products</option>
                            {products.map(product => (
                                <option key={product._id} value={product._id}>
                                    {product.title}
                                </option>
                            ))}
                        </select>
                        <div className="icon-field">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                style={{ minWidth: '200px', width: 'auto' }}
                                placeholder="Search pricing..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="icon">
                                <Icon icon="ion:search-outline" />
                            </span>
                        </div>
                        <button
                            className="btn btn-primary-600 d-flex align-items-center gap-2"
                            onClick={() => navigate('/add-product-pricing')}
                        >
                            <Icon icon="ic:baseline-plus" className="text-xl" />
                            Add Pricing
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredPricingList.length === 0 ? (
                    <div className="text-center py-5">
                        <Icon icon="mdi:currency-inr" className="text-64 text-primary-light mb-16" />
                        <p className="text-secondary-light">
                            {searchTerm || selectedProduct ? 'No pricing data found matching your filters' : 'No pricing data found. Create your first pricing entry!'}
                        </p>
                        {!searchTerm && !selectedProduct && (
                            <button
                                className="btn btn-primary-600 mt-3"
                                onClick={() => navigate('/add-product-pricing')}
                            >
                                <Icon icon="ic:baseline-plus" className="me-2" />
                                Add First Pricing
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table bordered-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Product</th>
                                    <th scope="col">Variant</th>
                                    <th scope="col">Base Price</th>
                                    <th scope="col">Discount</th>
                                    <th scope="col">Final Price</th>
                                    <th scope="col">Currency</th>
                                    <th scope="col">Status</th>
                                    <th scope="col" className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPricingList.map((pricing) => (
                                    <tr key={pricing._id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Icon
                                                    icon="solar:box-bold-duotone"
                                                    className="text-xl text-primary-600"
                                                />
                                                <span className="text-sm fw-semibold text-secondary-light">
                                                    {getProductName(pricing.productId)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {pricing.variantId ? (
                                                <span className="badge bg-info-100 text-info-600 text-xs">
                                                    {getVariantSKU(pricing.variantId)}
                                                </span>
                                            ) : (
                                                <span className="text-secondary-light text-sm">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-sm fw-semibold text-secondary-light">
                                                {pricing.currency} {pricing.basePrice.toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            {pricing.discountValue > 0 ? (
                                                <span className="badge bg-success-100 text-success-600 text-xs">
                                                    {pricing.discountType === 'percent'
                                                        ? `${pricing.discountValue}%`
                                                        : `${pricing.currency} ${pricing.discountValue}`}
                                                </span>
                                            ) : (
                                                <span className="text-secondary-light text-sm">No Discount</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-sm fw-bold text-primary-600">
                                                {pricing.currency} {pricing.finalPrice.toFixed(2)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-neutral-100 text-neutral-600 text-xs">
                                                {pricing.currency}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="form-switch switch-primary d-flex align-items-center">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={pricing.status}
                                                    onChange={() => handleToggleStatus(pricing._id, pricing.status)}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary-600 me-2"
                                                onClick={() => navigate(`/edit-product-pricing/${pricing._id}`)}
                                                title="Edit"
                                            >
                                                <Icon icon="lucide:edit" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger-600"
                                                onClick={() => {
                                                    setDeleteId(pricing._id);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Delete"
                                            >
                                                <Icon icon="fluent:delete-24-regular" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <Icon icon="material-symbols:warning" className="text-warning-600 text-64 mb-3" />
                                </div>
                                <p className="text-center mb-0">
                                    Are you sure you want to delete this pricing entry? This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary-600"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger-600"
                                    onClick={handleDelete}
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

export default ProductPricingListLayer;
