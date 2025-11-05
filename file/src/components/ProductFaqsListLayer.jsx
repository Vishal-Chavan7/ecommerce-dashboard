import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ProductFaqsListLayer = () => {
    const [faqs, setFaqs] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchFaqs();
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

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProduct) params.productId = selectedProduct;

            const response = await api.get('/admin/faqs', { params });
            const faqsData = response.data || [];

            // Populate product data
            const faqsWithProducts = faqsData.map(faq => {
                const product = products.find(p => p._id === faq.productId);
                return {
                    ...faq,
                    productName: product ? product.title : 'Unknown Product'
                };
            });

            setFaqs(faqsWithProducts);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/faqs/${deleteId}`);
            toast.success('FAQ deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchFaqs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Failed to delete FAQ');
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.title : 'Unknown Product';
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProductName(faq.productId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="card-title mb-0">Product FAQs</h5>
                        <span className="badge text-sm fw-semibold text-primary-600 bg-primary-100 px-20 py-9 radius-4">
                            {filteredFaqs.length} {filteredFaqs.length === 1 ? 'FAQ' : 'FAQs'}
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
                                placeholder="Search FAQs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="icon">
                                <Icon icon="ion:search-outline" />
                            </span>
                        </div>
                        <button
                            className="btn btn-primary-600 d-flex align-items-center gap-2"
                            onClick={() => navigate('/add-faq')}
                        >
                            <Icon icon="ic:baseline-plus" className="text-xl" />
                            Add FAQ
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
                ) : filteredFaqs.length === 0 ? (
                    <div className="text-center py-5">
                        <Icon icon="solar:question-circle-bold-duotone" className="text-64 text-primary-light mb-16" />
                        <p className="text-secondary-light">
                            {searchTerm || selectedProduct ? 'No FAQs found matching your filters' : 'No FAQs found. Create your first FAQ!'}
                        </p>
                        {!searchTerm && !selectedProduct && (
                            <button
                                className="btn btn-primary-600 mt-3"
                                onClick={() => navigate('/add-faq')}
                            >
                                <Icon icon="ic:baseline-plus" className="me-2" />
                                Add First FAQ
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table bordered-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Product</th>
                                    <th scope="col">Question</th>
                                    <th scope="col">Answer</th>
                                    <th scope="col">Date</th>
                                    <th scope="col" className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFaqs.map((faq) => (
                                    <tr key={faq._id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Icon
                                                    icon="solar:box-bold-duotone"
                                                    className="text-xl text-primary-600"
                                                />
                                                <span className="text-sm fw-semibold text-secondary-light">
                                                    {getProductName(faq.productId)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {faq.question.length > 60
                                                    ? `${faq.question.substring(0, 60)}...`
                                                    : faq.question}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {faq.answer.length > 80
                                                    ? `${faq.answer.substring(0, 80)}...`
                                                    : faq.answer}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-sm text-secondary-light">
                                                {new Date(faq.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary-600 me-2"
                                                onClick={() => navigate(`/edit-faq/${faq._id}`)}
                                                title="Edit"
                                            >
                                                <Icon icon="lucide:edit" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger-600"
                                                onClick={() => {
                                                    setDeleteId(faq._id);
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
                                    Are you sure you want to delete this FAQ? This action cannot be undone.
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

export default ProductFaqsListLayer;
