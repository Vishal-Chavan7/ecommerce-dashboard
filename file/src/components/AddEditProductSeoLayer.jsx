import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditProductSeoLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        slug: '',
        canonicalUrl: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProducts();
        if (isEditMode) {
            fetchSeoData();
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

    const fetchSeoData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/seo/${id}`);
            const seoData = response.data;

            setFormData({
                productId: seoData.productId || '',
                metaTitle: seoData.metaTitle || '',
                metaDescription: seoData.metaDescription || '',
                keywords: Array.isArray(seoData.keywords) ? seoData.keywords.join(', ') : '',
                slug: seoData.slug || '',
                canonicalUrl: seoData.canonicalUrl || ''
            });
        } catch (error) {
            console.error('Error fetching SEO data:', error);
            toast.error('Failed to load SEO data');
            navigate('/product-seo-list');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.productId.trim()) {
            newErrors.productId = 'Product is required';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        if (formData.metaTitle && formData.metaTitle.length > 60) {
            newErrors.metaTitle = 'Meta title should not exceed 60 characters (recommended for SEO)';
        }

        if (formData.metaDescription && formData.metaDescription.length > 160) {
            newErrors.metaDescription = 'Meta description should not exceed 160 characters (recommended for SEO)';
        }

        if (formData.canonicalUrl && !isValidUrl(formData.canonicalUrl)) {
            newErrors.canonicalUrl = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updates = { [name]: value };

        // Auto-generate slug from product name if not in edit mode
        if (name === 'productId' && value && !isEditMode) {
            const product = products.find(p => p._id === value);
            if (product && product.title) {
                updates.slug = generateSlug(product.title);
            }
        }

        setFormData(prev => ({
            ...prev,
            ...updates
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
            // Convert keywords string to array
            const keywordsArray = formData.keywords
                .split(',')
                .map(keyword => keyword.trim())
                .filter(keyword => keyword.length > 0);

            const submitData = {
                productId: formData.productId,
                metaTitle: formData.metaTitle.trim(),
                metaDescription: formData.metaDescription.trim(),
                keywords: keywordsArray,
                slug: formData.slug.trim().toLowerCase(),
                canonicalUrl: formData.canonicalUrl.trim()
            };

            if (isEditMode) {
                await api.put(`/admin/seo/${id}`, submitData);
                toast.success('SEO data updated successfully');
            } else {
                await api.post('/admin/seo', submitData);
                toast.success('SEO data created successfully');
            }

            navigate('/product-seo-list');
        } catch (error) {
            console.error('Error saving SEO data:', error);
            const errorMessage = error.response?.data?.message ||
                `Failed to ${isEditMode ? 'update' : 'create'} SEO data`;
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
                    <p className="mt-3 text-secondary-light">Loading SEO data...</p>
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
                            {isEditMode ? 'Edit Product SEO' : 'Add Product SEO'}
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
                                    disabled={loading || isEditMode}
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
                                {isEditMode && (
                                    <div className="form-text">Product cannot be changed in edit mode</div>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Slug <span className="text-danger-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="product-slug-url"
                                    disabled={loading}
                                />
                                <div className="form-text">
                                    URL-friendly version (lowercase, hyphens only). Auto-generated from product name.
                                </div>
                                {errors.slug && (
                                    <div className="invalid-feedback">{errors.slug}</div>
                                )}
                            </div>

                            {/* Meta Title */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.metaTitle ? 'is-invalid' : ''}`}
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    placeholder="Enter meta title for SEO..."
                                    disabled={loading}
                                />
                                <div className="form-text d-flex justify-content-between">
                                    <span>Recommended: 50-60 characters</span>
                                    <span className={formData.metaTitle.length > 60 ? 'text-danger' : formData.metaTitle.length > 50 ? 'text-warning' : 'text-success'}>
                                        {formData.metaTitle.length}/60
                                    </span>
                                </div>
                                {errors.metaTitle && (
                                    <div className="invalid-feedback">{errors.metaTitle}</div>
                                )}
                            </div>

                            {/* Meta Description */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Meta Description
                                </label>
                                <textarea
                                    className={`form-control ${errors.metaDescription ? 'is-invalid' : ''}`}
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    placeholder="Enter meta description for SEO..."
                                    rows="4"
                                    disabled={loading}
                                />
                                <div className="form-text d-flex justify-content-between">
                                    <span>Recommended: 150-160 characters</span>
                                    <span className={formData.metaDescription.length > 160 ? 'text-danger' : formData.metaDescription.length > 150 ? 'text-warning' : 'text-success'}>
                                        {formData.metaDescription.length}/160
                                    </span>
                                </div>
                                {errors.metaDescription && (
                                    <div className="invalid-feedback">{errors.metaDescription}</div>
                                )}
                            </div>

                            {/* Keywords */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Keywords
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="Enter keywords separated by commas..."
                                    disabled={loading}
                                />
                                <div className="form-text">
                                    Separate keywords with commas (e.g., smartphone, 5G, Samsung)
                                </div>
                            </div>

                            {/* Canonical URL */}
                            <div className="mb-20">
                                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Canonical URL
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.canonicalUrl ? 'is-invalid' : ''}`}
                                    name="canonicalUrl"
                                    value={formData.canonicalUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/product-page"
                                    disabled={loading}
                                />
                                <div className="form-text">
                                    The preferred URL for this product page
                                </div>
                                {errors.canonicalUrl && (
                                    <div className="invalid-feedback">{errors.canonicalUrl}</div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex align-items-center justify-content-center gap-3 mt-24">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger-600 border border-danger-600 text-md px-40 py-11 radius-8"
                                    onClick={() => navigate('/product-seo-list')}
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
                                            {isEditMode ? 'Update SEO' : 'Create SEO'}
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
                            <Icon icon="mdi:search-web" className="me-2" />
                            SEO Guidelines
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <h6 className="text-sm fw-semibold mb-2">Meta Title:</h6>
                            <ul className="text-sm text-secondary-light mb-0" style={{ paddingLeft: '20px' }}>
                                <li>Keep it under 60 characters</li>
                                <li>Include primary keyword</li>
                                <li>Make it compelling and unique</li>
                                <li>Accurately describe the product</li>
                            </ul>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-sm fw-semibold mb-2">Meta Description:</h6>
                            <ul className="text-sm text-secondary-light mb-0" style={{ paddingLeft: '20px' }}>
                                <li>Keep it under 160 characters</li>
                                <li>Include relevant keywords</li>
                                <li>Write compelling copy</li>
                                <li>Include a call-to-action</li>
                            </ul>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-sm fw-semibold mb-2">Keywords:</h6>
                            <ul className="text-sm text-secondary-light mb-0" style={{ paddingLeft: '20px' }}>
                                <li>Use 5-10 relevant keywords</li>
                                <li>Include product name and brand</li>
                                <li>Add category and features</li>
                                <li>Avoid keyword stuffing</li>
                            </ul>
                        </div>
                        <div className="alert alert-primary-50 border-primary-600" role="alert">
                            <div className="d-flex align-items-start gap-2">
                                <Icon icon="solar:lightbulb-bold-duotone" className="text-primary-600 text-xl mt-1" />
                                <div className="text-sm">
                                    <strong>Pro Tip:</strong> Regularly update your SEO metadata based on search trends and performance analytics to improve rankings.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Card */}
                {formData.productId && (formData.metaTitle || formData.metaDescription) && (
                    <div className="card mt-3">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                <Icon icon="material-symbols:search" className="me-2" />
                                Search Preview
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="mb-2">
                                <span className="badge bg-primary-100 text-primary-600 text-xs px-2 py-1 mb-2">
                                    {getProductName(formData.productId)}
                                </span>
                            </div>
                            <h6 className="text-sm fw-semibold text-primary-600 mb-1" style={{ fontSize: '18px' }}>
                                {formData.metaTitle || 'Meta Title Preview'}
                            </h6>
                            {formData.canonicalUrl && (
                                <div className="text-xs text-success-600 mb-1">
                                    {formData.canonicalUrl}
                                </div>
                            )}
                            <p className="text-sm text-secondary-light mb-0" style={{ fontSize: '13px' }}>
                                {formData.metaDescription || 'Meta description will appear here...'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEditProductSeoLayer;
