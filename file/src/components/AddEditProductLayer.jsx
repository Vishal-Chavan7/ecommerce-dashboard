import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditProductLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        brandId: '',
        categoryIds: [],
        type: 'simple',
        sku: '',
        thumbnail: '',
        status: true,
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    useEffect(() => {
        fetchBrands();
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data.filter(b => b.status));
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data.filter(c => c.status));
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/products/${id}`);
            const product = response.data;
            setFormData({
                title: product.title,
                slug: product.slug,
                description: product.description || '',
                brandId: product.brandId?._id || '',
                categoryIds: product.categoryIds?.map(cat => cat._id) || [],
                type: product.type,
                sku: product.sku,
                thumbnail: product.thumbnail || '',
                status: product.status,
                tags: product.tags || []
            });

            // Set preview if thumbnail exists
            if (product.thumbnail) {
                setThumbnailPreview(product.thumbnail);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            navigate('/products-list');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Special handling for slug field - only lowercase letters and numbers
        if (name === "slug") {
            const sanitizedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ""); // Remove any character that's not a-z or 0-9
            setFormData((prev) => ({
                ...prev,
                slug: sanitizedSlug,
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleCategoryToggle = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only JPEG, PNG, GIF, WEBP, SVG, and AVIF are allowed.');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setThumbnailFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Product title is required');
            return;
        }
        if (!formData.slug.trim()) {
            toast.error('Slug is required');
            return;
        }
        if (!formData.sku.trim()) {
            toast.error('SKU is required');
            return;
        }
        if (!formData.brandId) {
            toast.error('Please select a brand');
            return;
        }
        if (formData.categoryIds.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        // Prepare form data for submission
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('slug', formData.slug);
        submitData.append('description', formData.description);
        submitData.append('brandId', formData.brandId);
        submitData.append('categoryIds', JSON.stringify(formData.categoryIds));
        submitData.append('type', formData.type);
        submitData.append('sku', formData.sku);
        submitData.append('status', formData.status);
        submitData.append('tags', JSON.stringify(formData.tags));

        // Handle thumbnail file upload
        if (thumbnailFile) {
            submitData.append('thumbnail', thumbnailFile);
        }

        try {
            setLoading(true);
            if (isEditMode) {
                await api.put(`/admin/products/${id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Product updated successfully');
            } else {
                await api.post('/admin/products', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Product created successfully');
            }
            navigate('/products-list');
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='card'>
            <div className='card-header'>
                <button
                    type='button'
                    onClick={() => navigate('/products-list')}
                    className='btn btn-sm btn-outline-primary-600 d-flex align-items-center gap-2 mb-3'
                >
                    <Icon icon='mdi:arrow-left' />
                    Back to Products
                </button>
                <h5 className='card-title mb-2'>
                    {isEditMode ? 'Edit Product' : 'Add New Product'}
                </h5>
                <p className='text-secondary-light'>
                    {isEditMode ? 'Update product information' : 'Create a new product with core details'}
                </p>
            </div>

            <div className='card-body'>
                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <div className='mb-4'>
                        <h6 className='mb-3'>Basic Information</h6>
                        <div className='row g-3'>
                            <div className='col-md-8'>
                                <label className='form-label'>
                                    Product Title <span className='text-danger'>*</span>
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='title'
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder='e.g., Samsung Galaxy S23'
                                    required
                                />
                            </div>

                            <div className='col-md-4'>
                                <label className='form-label'>
                                    SKU <span className='text-danger'>*</span>
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                    placeholder='e.g., SAMS23BASE'
                                    required
                                />
                                <div className='form-text'>
                                    Unique product identifier
                                </div>
                            </div>

                            <div className='col-md-12'>
                                <label className='form-label'>
                                    Slug <span className='text-danger'>*</span>
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='slug'
                                    value={formData.slug}
                                    onChange={handleChange}
                                    pattern="[a-z0-9]+"
                                    title="Only lowercase letters and numbers are allowed"
                                    placeholder='e.g., samsunggalaxys23'
                                    required
                                />
                                <div className='form-text'>
                                    Only lowercase letters and numbers (e.g., samsunggalaxys23)
                                </div>
                            </div>

                            <div className='col-12'>
                                <label className='form-label'>Description</label>
                                <textarea
                                    className='form-control'
                                    rows='4'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder='Product description...'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Brand & Categories */}
                    <div className='mb-4'>
                        <h6 className='mb-3'>Brand & Categories</h6>
                        <div className='row g-3'>
                            <div className='col-md-6'>
                                <label className='form-label'>
                                    Brand <span className='text-danger'>*</span>
                                </label>
                                <select
                                    className='form-select'
                                    value={formData.brandId}
                                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                                    required
                                >
                                    <option value=''>Select a brand</option>
                                    {brands.map(brand => (
                                        <option key={brand._id} value={brand._id}>{brand.name}</option>
                                    ))}
                                </select>
                                {brands.length === 0 && (
                                    <div className='form-text text-warning'>
                                        <Icon icon='mdi:alert' className='me-1' />
                                        No brands available. Please create a brand first.
                                    </div>
                                )}
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label'>
                                    Product Type <span className='text-danger'>*</span>
                                </label>
                                <select
                                    className='form-select'
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value='simple'>Simple Product</option>
                                    <option value='variable'>Variable Product</option>
                                </select>
                                <div className='form-text'>
                                    Simple: Single product | Variable: Product with variants
                                </div>
                            </div>

                            <div className='col-12'>
                                <label className='form-label'>
                                    Categories <span className='text-danger'>*</span>
                                </label>
                                <div className='border rounded p-3 bg-light' style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {categories.length === 0 ? (
                                        <div className='text-center text-secondary-light py-4'>
                                            <Icon icon='mdi:alert-circle-outline' style={{ fontSize: '32px' }} className='text-warning' />
                                            <p className='mb-0 mt-2 fw-medium'>No categories available. Please create categories first.</p>
                                        </div>
                                    ) : (
                                        <div className='row g-3'>
                                            {categories.map(category => (
                                                <div key={category._id} className='col-md-4 col-sm-6'>
                                                    <div className='form-check p-3 border rounded bg-white d-flex align-items-center'>
                                                        <input
                                                            className='form-check-input mt-0 me-2'
                                                            type='checkbox'
                                                            id={`cat-${category._id}`}
                                                            checked={formData.categoryIds.includes(category._id)}
                                                            onChange={() => handleCategoryToggle(category._id)}
                                                        />
                                                        <label className='form-check-label fw-medium mb-0' htmlFor={`cat-${category._id}`}>
                                                            {category.name}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className='form-text mt-2'>
                                    <Icon icon='mdi:information-outline' className='me-1' />
                                    Selected: <span className='fw-semibold'>{formData.categoryIds.length}</span> {formData.categoryIds.length === 1 ? 'category' : 'categories'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media & Tags */}
                    <div className='mb-4 mt-3'>
                        <h6 className='mb-3'>Media & Tags</h6>
                        <div className='row g-3'>
                            <div className='col-md-12'>
                                <label className='form-label'>Product Thumbnail</label>
                                <input
                                    type='file'
                                    className='form-control'
                                    accept='image/*'
                                    onChange={handleFileChange}
                                />
                                <div className='form-text'>
                                    Supported: JPG, PNG, GIF, WEBP, SVG, AVIF (Max 5MB)
                                </div>
                            </div>

                            {thumbnailPreview && (
                                <div className='col-12'>
                                    <div className='border rounded p-3 bg-neutral-50 text-center'>
                                        <img
                                            src={thumbnailPreview}
                                            alt='Thumbnail Preview'
                                            className='rounded'
                                            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain' }}
                                        />
                                        <p className='text-sm text-secondary-light mt-2'>Thumbnail Preview</p>
                                    </div>
                                </div>
                            )}

                            <div className='col-12'>
                                <label className='form-label'>Tags</label>
                                <div className='input-group mb-2'>
                                    <input
                                        type='text'
                                        className='form-control'
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                                        placeholder='Type a tag and press Enter'
                                    />
                                    <button
                                        type='button'
                                        className='btn btn-outline-primary-600'
                                        onClick={handleAddTag}
                                    >
                                        <Icon icon='ph:plus' />
                                        Add Tag
                                    </button>
                                </div>
                                <div className='d-flex flex-wrap gap-2'>
                                    {formData.tags.map((tag, index) => (
                                        <span key={index} className='badge bg-primary-100 text-primary-600 d-flex align-items-center gap-1' style={{ fontSize: '14px', padding: '6px 12px' }}>
                                            {tag}
                                            <button
                                                type='button'
                                                className='btn-close btn-close-sm'
                                                style={{ fontSize: '10px' }}
                                                onClick={() => handleRemoveTag(tag)}
                                            ></button>
                                        </span>
                                    ))}
                                </div>
                                <div className='form-text'>
                                    Tags help categorize and search products (e.g., smartphone, android)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Settings */}
                    <div className='mb-4 mt-3'>
                        <h6 className='mb-3'>Product Settings</h6>
                        <div className='row g-3'>
                            <div className='col-12'>
                                <div className='card border shadow-none bg-light'>
                                    <div className='card-body p-3'>
                                        <div className='d-flex align-items-center justify-content-between'>
                                            <div>
                                                <label className='form-label fw-semibold mb-1'>
                                                    Product Status
                                                </label>
                                                <p className='text-sm text-secondary mb-0'>
                                                    {formData.status
                                                        ? 'This product is active and visible to customers'
                                                        : 'This product is inactive and hidden from customers'}
                                                </p>
                                            </div>
                                            <div className='d-flex align-items-center gap-3'>
                                                <span className={`badge ${formData.status ? 'bg-success' : 'bg-secondary'} px-3 py-2`}>
                                                    {formData.status ? 'Active' : 'Inactive'}
                                                </span>
                                                <div className='form-check form-switch form-switch-lg m-0'>
                                                    <input
                                                        className='form-check-input'
                                                        type='checkbox'
                                                        role='switch'
                                                        id='status'
                                                        checked={formData.status}
                                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                                        style={{ width: '48px', height: '24px', cursor: 'pointer' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='d-flex justify-content-end gap-3 mt-3'>
                        <button
                            type='button'
                            onClick={() => navigate('/products-list')}
                            className='btn btn-secondary-600 '
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='btn btn-primary-600 d-flex align-items-center gap-2'
                        >
                            {loading ? (
                                <>
                                    <div className='spinner-border spinner-border-sm' role='status'>
                                        <span className='visually-hidden'>Loading...</span>
                                    </div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Icon icon='mdi:content-save' />
                                    {isEditMode ? 'Update Product' : 'Create Product'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProductLayer;
