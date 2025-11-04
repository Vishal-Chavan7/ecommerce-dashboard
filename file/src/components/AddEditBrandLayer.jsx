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
        status: true,
        isFeatured: false
    });

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
                status: brand.status,
                isFeatured: brand.isFeatured
            });
        } catch (error) {
            console.error('Error fetching brand:', error);
            toast.error('Failed to load brand');
            navigate('/brands-list');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        });
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

        const payload = { ...formData };

        try {
            setLoading(true);
            if (isEditMode) {
                await api.put(`/admin/brands/${id}`, payload);
                toast.success('Brand updated successfully');
            } else {
                await api.post('/admin/brands', payload);
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
                                    value={formData.name}
                                    onChange={handleNameChange}
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
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder='e.g., nike, apple, samsung'
                                    required
                                />
                                <div className='form-text'>
                                    URL-friendly version of the name (auto-generated)
                                </div>
                            </div>

                            <div className='col-md-6'>
                                <label className='form-label'>Logo URL</label>
                                <input
                                    type='url'
                                    className='form-control'
                                    value={formData.logo}
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder='https://cdn.com/brands/logo.png'
                                />
                                <div className='form-text'>
                                    Enter a valid image URL for the brand logo
                                </div>
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

                            <div className='col-md-6'>
                                <label className='form-label d-block'>Brand Options</label>
                                <div className='d-flex gap-4'>
                                    <div className='form-check form-switch'>
                                        <input
                                            className='form-check-input'
                                            type='checkbox'
                                            role='switch'
                                            id='status'
                                            checked={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                        />
                                        <label className='form-check-label' htmlFor='status'>
                                            Active Status
                                        </label>
                                    </div>

                                    <div className='form-check form-switch'>
                                        <input
                                            className='form-check-input'
                                            type='checkbox'
                                            role='switch'
                                            id='isFeatured'
                                            checked={formData.isFeatured}
                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        />
                                        <label className='form-check-label' htmlFor='isFeatured'>
                                            Featured Brand
                                        </label>
                                    </div>
                                </div>
                                <div className='form-text mt-2'>
                                    Featured brands appear in special sections
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo Preview */}
                    {formData.logo && (
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
