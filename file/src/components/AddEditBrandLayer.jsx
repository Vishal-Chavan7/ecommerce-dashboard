import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditBrandLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo: '',
        description: '',
        website: '',
        status: true
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchBrand();
        }
    }, [id]);

    const fetchBrand = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/brands/${id}`);
            const brand = response.data;
            setFormData({
                name: brand.name,
                slug: brand.slug,
                logo: brand.logo || '',
                description: brand.description || '',
                website: brand.website || '',
                status: brand.status
            });
            if (brand.logo) {
                setLogoPreview(brand.logo);
            }
        } catch (error) {
            console.error('Error fetching brand:', error);
            toast.error('Failed to load brand');
            navigate('/brands-list');
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

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoFile(file);
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Brand name is required');
            return;
        }

        if (!formData.slug.trim()) {
            toast.error('Slug is required');
            return;
        }

        try {
            setLoading(true);

            // Create FormData for multipart upload
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('slug', formData.slug);
            submitData.append('description', formData.description);
            submitData.append('website', formData.website);
            submitData.append('status', formData.status);

            // Handle logo file upload
            if (logoFile) {
                submitData.append('logo', logoFile);
            }

            if (isEditMode) {
                await api.put(`/admin/brands/${id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Brand updated successfully');
            } else {
                await api.post('/admin/brands', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Brand created successfully');
            }
            navigate('/brands-list');
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error(error.response?.data?.message || 'Failed to save brand');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='card'>
            <div className='card-header'>
                <button
                    type='button'
                    onClick={() => navigate('/brands-list')}
                    className='btn btn-sm btn-outline-primary-600 d-flex align-items-center gap-2 mb-3'
                >
                    <Icon icon='mdi:arrow-left' />
                    Back to Brands
                </button>
                <h5 className='card-title mb-2'>
                    {isEditMode ? 'Edit Brand' : 'Add New Brand'}
                </h5>
                <p className='text-secondary-light'>
                    {isEditMode ? 'Update brand information' : 'Create a new brand for your products'}
                </p>
            </div>

            <div className='card-body'>
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <h6 className='mb-3'>Basic Information</h6>
                        <div className='row g-3'>
                            <div className='col-md-6'>
                                <label className='form-label'>
                                    Brand Name <span className='text-danger'>*</span>
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder='e.g., Nike, Apple, Samsung'
                                    required
                                />
                            </div>

                            <div className='col-md-6'>
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
                                    placeholder='e.g., nikerunning'
                                    required
                                />
                                <div className='form-text'>
                                    Only lowercase letters and numbers (e.g., samsunggalaxy)
                                </div>
                            </div>

                            {/* Logo Upload Section */}
                            <div className='col-md-6'>
                                <label className='form-label'>Brand Logo</label>

                                <div className='mb-3'>
                                    <input
                                        type='file'
                                        className='form-control'
                                        accept='image/*'
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {logoPreview && (
                                    <div className='mt-3 text-center'>
                                        <img
                                            src={logoPreview}
                                            alt='Logo preview'
                                            className='rounded border'
                                            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                                        />
                                        <p className='text-sm text-secondary-light mt-2'>Logo Preview</p>
                                    </div>
                                )}
                                <small className='text-secondary-light d-block mt-2'>
                                    Supported: JPG, PNG, GIF, WEBP, SVG, AVIF (Max 5MB)
                                </small>
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label'>Website URL</label>
                                <input
                                    type='url'
                                    className='form-control'
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder='https://example.com'
                                />
                                <div className='form-text'>
                                    Official brand website
                                </div>
                            </div>

                            <div className='col-12'>
                                <label className='form-label'>Description</label>
                                <textarea
                                    className='form-control'
                                    rows='4'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder='Brief description about the brand...'
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Status Section */}
                    <div className='mb-4'>
                        <h6 className='mb-3 mt-2'>Settings</h6>
                        <div className='row g-3'>
                            <div className='col-md-6'>
                                <div className='card shadow-sm border-0 bg-neutral-50 p-20 radius-8'>
                                    <div className='d-flex align-items-center justify-content-between gap-4'>
                                        <div className='flex-grow-1'>
                                            <div className='d-flex align-items-center gap-2 mb-2'>
                                                <h6 className='text-md mb-0'>Brand Status</h6>
                                                <span className={`badge text-sm px-2 py-1 ${formData.status ? 'bg-success-600' : 'bg-secondary-600'}`}>
                                                    {formData.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className='text-secondary-light text-sm mb-0'>
                                                {formData.status
                                                    ? 'This brand is active and visible to customers'
                                                    : 'This brand is inactive and hidden from the store'}
                                            </p>
                                        </div>
                                        <div className='form-check form-switch pe-3'>
                                            <input
                                                className='form-check-input'
                                                type='checkbox'
                                                role='switch'
                                                id='status'
                                                checked={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                                style={{ width: '52px', height: '28px', cursor: 'pointer' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo Preview - Remove this old section since we have inline preview now */}
                    {false && formData.logo && (
                        <div className='mb-4'>
                            <h6 className='mb-3'>Logo Preview</h6>
                            <div className='border rounded p-3 bg-neutral-50 text-center'>
                                <img
                                    src={formData.logo}
                                    alt='Brand Logo'
                                    className='rounded'
                                    style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        toast.error('Invalid image URL');
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className='d-flex justify-content-end gap-3'>
                        <button
                            type='button'
                            onClick={() => navigate('/brands-list')}
                            className='btn btn-secondary-600'
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
                                    {isEditMode ? 'Update Brand' : 'Create Brand'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditBrandLayer;
