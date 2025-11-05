import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditProductFaqLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        question: '',
        answer: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        if (isEditMode) {
            fetchFaqData();
        }
    }, [id]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
    };

    const fetchFaqData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/faqs/${id}`);
            const faqData = response.data;

            setFormData({
                productId: faqData.productId || '',
                question: faqData.question || '',
                answer: faqData.answer || ''
            });
        } catch (error) {
            console.error('Error fetching FAQ data:', error);
            toast.error('Failed to load FAQ data');
            navigate('/faqs-list');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.productId.trim()) {
            newErrors.productId = 'Product is required';
        }

        if (!formData.question.trim()) {
            newErrors.question = 'Question is required';
        } else if (formData.question.trim().length < 10) {
            newErrors.question = 'Question must be at least 10 characters';
        } else if (formData.question.trim().length > 500) {
            newErrors.question = 'Question must not exceed 500 characters';
        }

        if (!formData.answer.trim()) {
            newErrors.answer = 'Answer is required';
        } else if (formData.answer.trim().length < 10) {
            newErrors.answer = 'Answer must be at least 10 characters';
        } else if (formData.answer.trim().length > 2000) {
            newErrors.answer = 'Answer must not exceed 2000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                productId: formData.productId,
                question: formData.question.trim(),
                answer: formData.answer.trim()
            };

            if (isEditMode) {
                await api.put(`/admin/faqs/${id}`, submitData);
                toast.success('FAQ updated successfully');
            } else {
                await api.post('/admin/faqs', submitData);
                toast.success('FAQ created successfully');
            }

            navigate('/faqs-list');
        } catch (error) {
            console.error('Error saving FAQ:', error);
            const errorMessage = error.response?.data?.message ||
                `Failed to ${isEditMode ? 'update' : 'create'} FAQ`;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.title : '';
    };

    if (isEditMode && loading && !formData.productId) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary-600" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-secondary-light">Loading FAQ data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="row gy-4">
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">
                            {isEditMode ? 'Edit FAQ' : 'Add New FAQ'}
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Product Selection */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Product <span className="text-danger-600">*</span>
                                </label>
                                <select
                                    className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                                    name="productId"
                                    value={formData.productId}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="">Select a product</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id}>
                                            {product.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.productId && (
                                    <div className="invalid-feedback">{errors.productId}</div>
                                )}
                            </div>

                            {/* Question */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Question <span className="text-danger-600">*</span>
                                </label>
                                <textarea
                                    className={`form-control ${errors.question ? 'is-invalid' : ''}`}
                                    name="question"
                                    value={formData.question}
                                    onChange={handleChange}
                                    placeholder="Enter the frequently asked question..."
                                    rows="3"
                                    disabled={loading}
                                />
                                <div className="form-text d-flex justify-content-between">
                                    <span>10-500 characters</span>
                                    <span className={formData.question.length > 500 ? 'text-danger' : ''}>
                                        {formData.question.length}/500
                                    </span>
                                </div>
                                {errors.question && (
                                    <div className="invalid-feedback">{errors.question}</div>
                                )}
                            </div>

                            {/* Answer */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Answer <span className="text-danger-600">*</span>
                                </label>
                                <textarea
                                    className={`form-control ${errors.answer ? 'is-invalid' : ''}`}
                                    name="answer"
                                    value={formData.answer}
                                    onChange={handleChange}
                                    placeholder="Enter the detailed answer..."
                                    rows="6"
                                    disabled={loading}
                                />
                                <div className="form-text d-flex justify-content-between">
                                    <span>10-2000 characters</span>
                                    <span className={formData.answer.length > 2000 ? 'text-danger' : ''}>
                                        {formData.answer.length}/2000
                                    </span>
                                </div>
                                {errors.answer && (
                                    <div className="invalid-feedback">{errors.answer}</div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex align-items-center justify-content-center gap-3 mt-24">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger-600 border border-danger-600 text-md px-40 py-11 radius-8"
                                    onClick={() => navigate('/faqs-list')}
                                    disabled={loading}
                                >
                                    <Icon icon="mdi:cancel" className="me-2" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary-600 text-md px-40 py-11 radius-8"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {isEditMode ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="material-symbols:save" className="me-2" />
                                            {isEditMode ? 'Update FAQ' : 'Create FAQ'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Info Sidebar */}
            <div className="col-lg-4">
                <div className="card">
                    <div className="card-header">
                        <h6 className="card-title mb-0">
                            <Icon icon="solar:info-circle-bold-duotone" className="me-2" />
                            FAQ Guidelines
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <h6 className="text-sm fw-semibold mb-2">Question Tips:</h6>
                            <ul className="text-sm text-secondary-light mb-0" style={{ paddingLeft: '20px' }}>
                                <li>Be specific and clear</li>
                                <li>Use customer language</li>
                                <li>Focus on common concerns</li>
                                <li>Keep it concise (10-500 chars)</li>
                            </ul>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-sm fw-semibold mb-2">Answer Tips:</h6>
                            <ul className="text-sm text-secondary-light mb-0" style={{ paddingLeft: '20px' }}>
                                <li>Provide detailed information</li>
                                <li>Use simple language</li>
                                <li>Include relevant details</li>
                                <li>Be helpful and friendly</li>
                                <li>Mention policies if needed</li>
                            </ul>
                        </div>
                        <div className="alert alert-primary-50 border-primary-600" role="alert">
                            <div className="d-flex align-items-start gap-2">
                                <Icon icon="solar:lightbulb-bold-duotone" className="text-primary-600 text-xl mt-1" />
                                <div className="text-sm">
                                    <strong>SEO Benefit:</strong> Well-written FAQs improve your product's search engine ranking and help customers make informed decisions.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Card */}
                {formData.productId && formData.question && formData.answer && (
                    <div className="card mt-3">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <Icon icon="solar:eye-bold-duotone" className="me-2" />
                                Preview
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <span className="badge bg-primary-100 text-primary-600 text-xs px-2 py-1">
                                    {getProductName(formData.productId)}
                                </span>
                            </div>
                            <h6 className="text-sm fw-semibold mb-2">
                                <Icon icon="solar:question-circle-bold" className="text-primary-600 me-1" />
                                {formData.question}
                            </h6>
                            <p className="text-sm text-secondary-light mb-0">
                                {formData.answer}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEditProductFaqLayer;
