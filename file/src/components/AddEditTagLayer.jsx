import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const AddEditTagLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        status: true,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditMode) {
            fetchTag();
        }
    }, [id]);

    const fetchTag = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/tags/${id}`);
            setFormData({
                name: response.data.name || '',
                slug: response.data.slug || '',
                status: response.data.status !== undefined ? response.data.status : true,
            });
        } catch (error) {
            console.error('Error fetching tag:', error);
            toast.error('Failed to load tag details');
            navigate('/tags-list');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                name: value,
                slug: generateSlug(value),
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tag name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Tag name must be at least 2 characters';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Tag name must not exceed 50 characters';
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (formData.slug.length < 2) {
            newErrors.slug = 'Slug must be at least 2 characters';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode) {
                await api.put(`/admin/tags/${id}`, formData);
                toast.success('Tag updated successfully');
            } else {
                await api.post('/admin/tags', formData);
                toast.success('Tag created successfully');
            }

            navigate('/tags-list');
        } catch (error) {
            console.error('Error saving tag:', error);
            if (error.response?.status === 409) {
                toast.error('A tag with this slug already exists');
                setErrors(prev => ({ ...prev, slug: 'This slug is already in use' }));
            } else {
                toast.error(error.response?.data?.message || 'Failed to save tag');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/tags-list');
    };

    if (loading && isEditMode) {
        return (
            <div className="card">
                <div className="card-body">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary-600"
                        onClick={handleCancel}
                    >
                        <Icon icon="ep:back" />
                    </button>
                    <h5 className="card-title mb-0">
                        {isEditMode ? 'Edit Tag' : 'Add New Tag'}
                    </h5>
                </div>
            </div>

            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-4">
                        {/* Tag Name */}
                        <div className="col-md-6">
                            <label className="form-label">
                                Tag Name <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., New Arrival, Bestseller, Trending"
                                maxLength={50}
                            />
                            {errors.name && (
                                <div className="invalid-feedback">{errors.name}</div>
                            )}
                            <small className="text-secondary-light">
                                Enter a descriptive name for the tag
                            </small>
                        </div>

                        {/* Slug */}
                        <div className="col-md-6">
                            <label className="form-label">
                                Slug <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className={`form-control ${errors.slug ? 'is-invalid' : ''}`}
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                placeholder="e.g., new-arrival, bestseller"
                                maxLength={50}
                            />
                            {errors.slug && (
                                <div className="invalid-feedback">{errors.slug}</div>
                            )}
                            <small className="text-secondary-light">
                                URL-friendly version (lowercase, hyphens only)
                            </small>
                        </div>

                        {/* Status */}
                        <div className="col-12">
                            <div className="card bg-neutral-50 border-neutral-200">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between gap-3">
                                        <div>
                                            <h6 className="text-md mb-1">Tag Status</h6>
                                            <p className="text-sm text-secondary-light mb-0">
                                                {formData.status
                                                    ? 'This tag is active and will be visible for product assignment'
                                                    : 'This tag is inactive and will not be available for products'}
                                            </p>
                                        </div>
                                        <div className="form-switch switch-primary">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                role="switch"
                                                name="status"
                                                checked={formData.status}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="col-12">
                            <div className="alert alert-info d-flex align-items-start gap-2 mb-0">
                                <Icon icon="material-symbols:info" className="text-info-600 text-xl mt-1" />
                                <div>
                                    <h6 className="text-sm fw-semibold mb-1">Tag Usage</h6>
                                    <ul className="text-sm mb-0 ps-3">
                                        <li>Tags help organize and categorize products</li>
                                        <li>Examples: "new", "trending", "bestseller", "sale", "featured"</li>
                                        <li>Multiple tags can be assigned to each product</li>
                                        <li>Tags are used for filtering and product discovery</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="d-flex align-items-center justify-content-end gap-3 mt-24">
                        <button
                            type="button"
                            className="btn btn-outline-secondary-600"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            <Icon icon="ic:round-close" className="me-2" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary-600"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Icon icon="ic:round-check" className="me-2" />
                                    {isEditMode ? 'Update Tag' : 'Create Tag'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditTagLayer;
