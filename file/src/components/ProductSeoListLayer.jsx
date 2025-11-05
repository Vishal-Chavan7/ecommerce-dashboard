import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ProductSeoListLayer = () => {
    const [seoList, setSeoList] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchSeoList();
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

    const fetchSeoList = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProduct) params.productId = selectedProduct;

            const response = await api.get('/admin/seo', { params });
            const seoData = response.data || [];

            // Populate product data
            const seoWithProducts = seoData.map(seo => {
                const product = products.find(p => p._id === seo.productId);
                return {
                    ...seo,
                    productName: product ? product.title : 'Unknown Product'
                };
            });

            setSeoList(seoWithProducts);
        } catch (error) {
            console.error('Error fetching SEO data:', error);
            toast.error('Failed to load SEO data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/seo/${deleteId}`);
            toast.success('SEO data deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchSeoList();
        } catch (error) {
            console.error('Error deleting SEO data:', error);
            toast.error('Failed to delete SEO data');
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.title : 'Unknown Product';
    };

    const filteredSeoList = seoList.filter(seo => {
        const keywordsStr = Array.isArray(seo.keywords) ? seo.keywords.join(' ') : '';
        return seo.metaTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seo.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seo.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            keywordsStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getProductName(seo.productId).toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="card-title mb-0">Product SEO</h5>
                        <span className="badge text-sm fw-semibold text-primary-600 bg-primary-100 px-20 py-9 radius-4">
                            {filteredSeoList.length} {filteredSeoList.length === 1 ? 'Entry' : 'Entries'}
                        </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <select
                            className="form-select form-select-sm w-auto"
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
                                className="form-control form-control-sm w-auto"
                                placeholder="Search SEO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="icon">
                                <Icon icon="ion:search-outline" />
                            </span>
                        </div>
                        <button
                            className="btn btn-primary-600 d-flex align-items-center gap-2"
                            onClick={() => navigate('/add-product-seo')}
                        >
                            <Icon icon="ic:baseline-plus" className="text-xl" />
                            Add SEO
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
                ) : filteredSeoList.length === 0 ? (
                    <div className="text-center py-5">
                        <Icon icon="mdi:search-web" className="text-64 text-primary-light mb-16" />
                        <p className="text-secondary-light">
                            {searchTerm || selectedProduct ? 'No SEO data found matching your filters' : 'No SEO data found. Create your first SEO entry!'}
                        </p>
                        {!searchTerm && !selectedProduct && (
                            <button
                                className="btn btn-primary-600 mt-3"
                                onClick={() => navigate('/add-product-seo')}
                            >
                                <Icon icon="ic:baseline-plus" className="me-2" />
                                Add First SEO Entry
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table bordered-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Product</th>
                                    <th scope="col">Slug</th>
                                    <th scope="col">Meta Title</th>
                                    <th scope="col">Meta Description</th>
                                    <th scope="col">Keywords</th>
                                    <th scope="col" className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSeoList.map((seo) => (
                                    <tr key={seo._id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Icon
                                                    icon="solar:box-bold-duotone"
                                                    className="text-xl text-primary-600"
                                                />
                                                <span className="text-sm fw-semibold text-secondary-light">
                                                    {getProductName(seo.productId)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-primary-100 text-primary-600 text-xs">
                                                {seo.slug || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {seo.metaTitle?.length > 50
                                                    ? `${seo.metaTitle.substring(0, 50)}...`
                                                    : seo.metaTitle || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {seo.metaDescription?.length > 60
                                                    ? `${seo.metaDescription.substring(0, 60)}...`
                                                    : seo.metaDescription || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {Array.isArray(seo.keywords) && seo.keywords.length > 0
                                                    ? seo.keywords.slice(0, 3).join(', ') + (seo.keywords.length > 3 ? '...' : '')
                                                    : '-'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary-600 me-2"
                                                onClick={() => navigate(`/edit-product-seo/${seo._id}`)}
                                                title="Edit"
                                            >
                                                <Icon icon="lucide:edit" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger-600"
                                                onClick={() => {
                                                    setDeleteId(seo._id);
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
                                    Are you sure you want to delete this SEO data? This action cannot be undone.
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

export default ProductSeoListLayer;
