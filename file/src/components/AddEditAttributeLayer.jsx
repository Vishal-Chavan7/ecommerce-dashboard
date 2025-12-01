import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditAttributeLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'select',
        isFilter: true,
        status: true
    });
    const [values, setValues] = useState([{ id: '', label: '' }]);

    useEffect(() => {
        if (isEditMode) {
            fetchAttribute();
        }
    }, [id]);

    const fetchAttribute = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/attributes/${id}`);
            const attr = response.data;
            setFormData({
                name: attr.name,
                slug: attr.slug,
                type: attr.type,
                isFilter: attr.isFilter,
                status: attr.status
            });
            setValues(attr.values && attr.values.length > 0 ? attr.values : [{ id: '', label: '' }]);
        } catch (error) {
            console.error('Error fetching attribute:', error);
            toast.error('Failed to load attribute');
            navigate('/attributes-list');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e) => {
        setFormData({ ...formData, name: e.target.value });
    };

    const handleSlugChange = (e) => {
        const slug = e.target.value.toLowerCase().replace(/[^a-z]/g, '');
        setFormData({ ...formData, slug });
    };

    const handleAddValue = () => {
        setValues([...values, { id: '', label: '' }]);
    };

    const handleRemoveValue = (index) => {
        if (values.length > 1) {
            setValues(values.filter((_, i) => i !== index));
        }
    };

    const handleValueChange = (index, field, value) => {
        const newValues = [...values];
        newValues[index][field] = value;
        if (field === 'label') {
            newValues[index].id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        }
        setValues(newValues);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Attribute name is required');
            return;
        }
        if (!formData.slug.trim()) {
            toast.error('Slug is required');
            return;
        }
        if ((formData.type === 'select' || formData.type === 'multiselect')) {
            const validValues = values.filter(v => v.label.trim() && v.id.trim());
            if (validValues.length === 0) {
                toast.error('At least one value is required for select/multiselect types');
                return;
            }
            const ids = validValues.map(v => v.id);
            if (new Set(ids).size !== ids.length) {
                toast.error('Value IDs must be unique');
                return;
            }
        }
        const validValues = values.filter(v => v.label.trim() && v.id.trim());
        const payload = {
            ...formData,
            values: (formData.type === 'select' || formData.type === 'multiselect') ? validValues : []
        };
        try {
            setLoading(true);
            if (isEditMode) {
                await api.put(`/admin/attributes/${id}`, payload);
                toast.success('Attribute updated successfully');
            } else {
                await api.post('/admin/attributes', payload);
                toast.success('Attribute created successfully');
            }
            navigate('/attributes-list');
        } catch (error) {
            console.error('Error saving attribute:', error);
            toast.error(error.response?.data?.message || 'Failed to save attribute');
        } finally {
            setLoading(false);
        }
    };

    const needsValues = formData.type === 'select' || formData.type === 'multiselect';
    return (
        <div className='card'>
            <div className='card-header'>
                <button
                    type='button'
                    onClick={() => navigate('/attributes-list')}
                    className='btn btn-sm btn-outline-primary-600 d-flex align-items-center gap-2 mb-3'
                >
                    <Icon icon='mdi:arrow-left' />
                    Back to Attributes
                </button>
                <h5 className='card-title mb-2'>
                    {isEditMode ? 'Edit Attribute' : 'Add New Attribute'}
                </h5>
                <p className='text-secondary-light'>
                    {isEditMode ? 'Update attribute information' : 'Create a new product attribute'}
                </p>
            </div>
            <div className='card-body'>
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <h6 className='mb-3'>Basic Information</h6>
                        <div className='row g-3'>
                            <div className='col-md-6'>
                                <label className='form-label'>Attribute Name <span className='text-danger'>*</span></label>
                                <input type='text' className='form-control' value={formData.name} onChange={handleNameChange} placeholder='e.g., Color, Size, Material' required />
                            </div>
                            <div className='col-md-6'>
                                <label className='form-label'>Slug <span className='text-danger'>*</span></label>
                                <input type='text' className='form-control' value={formData.slug} onChange={handleSlugChange} placeholder='e.g., color, size, material' required />
                                <small className='form-text text-muted'>Only lowercase letters allowed</small>
                            </div>
                            <div className='col-md-6'>
                                <label className='form-label'>Attribute Type <span className='text-danger'>*</span></label>
                                <select className='form-select' value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                                    <option value='text'>Text (Free input)</option>
                                    <option value='number'>Number (Numeric values)</option>
                                    <option value='select'>Select (Single choice)</option>
                                    <option value='multiselect'>Multi-Select (Multiple choices)</option>
                                </select>
                                <div className='form-text'>
                                    {formData.type === 'text' && 'Users can enter any text value'}
                                    {formData.type === 'number' && 'Users can enter numeric values only'}
                                    {formData.type === 'select' && 'Users can select one option from dropdown'}
                                    {formData.type === 'multiselect' && 'Users can select multiple options'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options and Status Section */}
                    <div className='mb-4'>
                        <h6 className='mb-3 mt-2'>Settings</h6>
                        <div className='row g-3'>
                            {/* Use as Filter Option */}
                            <div className='col-md-6'>
                                <div className='card shadow-sm border-0 bg-neutral-50 p-20 radius-8'>
                                    <div className='d-flex align-items-center justify-content-between gap-4'>
                                        <div className='flex-grow-1'>
                                            <div className='d-flex align-items-center gap-2 mb-2'>
                                                <h6 className='text-md mb-0'>Use as Filter</h6>
                                                <span className={`badge text-sm px-2 py-1 ${formData.isFilter ? 'bg-success-600' : 'bg-secondary-600'}`}>
                                                    {formData.isFilter ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>
                                            <p className='text-secondary-light text-sm mb-0'>
                                                {formData.isFilter
                                                    ? 'This attribute will appear in product filters'
                                                    : 'This attribute will not appear in filters'}
                                            </p>
                                        </div>
                                        <div className='form-switch switch-primary d-flex align-items-center gap-3'>
                                            <input
                                                className='form-check-input'
                                                type='checkbox'
                                                role='switch'
                                                id='isFilter'
                                                checked={formData.isFilter}
                                                onChange={(e) => setFormData({ ...formData, isFilter: e.target.checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div className='col-md-6'>
                                <div className='card shadow-sm border-0 bg-neutral-50 p-20 radius-8'>
                                    <div className='d-flex align-items-center justify-content-between gap-4'>
                                        <div className='flex-grow-1'>
                                            <div className='d-flex align-items-center gap-2 mb-2'>
                                                <h6 className='text-md  mt-10 mb-0'>Attribute Status</h6>
                                                <span className={`badge text-sm px-2 py-1 ${formData.status ? 'bg-success-600' : 'bg-secondary-600'}`}>
                                                    {formData.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className='text-secondary-light text-sm mb-0'>
                                                {formData.status
                                                    ? 'This attribute is active and available for use'
                                                    : 'This attribute is inactive and hidden from products'}
                                            </p>
                                        </div>
                                        <div className='form-switch switch-primary d-flex align-items-center gap-3'>
                                            <input
                                                className='form-check-input'
                                                type='checkbox'
                                                role='switch'
                                                id='status'
                                                checked={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {needsValues && (
                        <div className='mb-4'>
                            <div className='d-flex align-items-center justify-content-between mb-3'>
                                <div>
                                    <h6 className='mb-1 mt-2'>Attribute Values</h6>
                                    <p className='text-secondary-light text-sm mb-0'>Define the available options for this attribute</p>
                                </div>
                                <button type='button' onClick={handleAddValue} className='btn btn-primary-600 btn-sm d-flex align-items-center gap-2'>
                                    <Icon icon='ph:plus' />Add Value
                                </button>
                            </div>
                            <div className='d-flex flex-column gap-3'>
                                {values.map((value, index) => (
                                    <div key={index} className='row g-2 align-items-start'>
                                        <div className='col-md-5'>
                                            <input type='text' className='form-control' value={value.label} onChange={(e) => handleValueChange(index, 'label', e.target.value)} placeholder='e.g., Red, Large, Cotton' />
                                        </div>
                                        <div className='col-md-5'>
                                            <input type='text' className='form-control bg-neutral-50' value={value.id} onChange={(e) => handleValueChange(index, 'id', e.target.value)} placeholder='Auto-generated ID' readOnly />
                                        </div>
                                        <div className='col-md-2'>
                                            <button type='button' onClick={() => handleRemoveValue(index)} className='btn btn-outline-danger-600 btn-sm w-100' disabled={values.length === 1}>
                                                <Icon icon='fluent:delete-24-regular' />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {values.length === 0 && (
                                <div className='text-center py-4 text-secondary-light'>
                                    <Icon icon='mdi:format-list-bulleted' style={{ fontSize: '48px' }} />
                                    <p className='mb-0'>No values added yet. Click "Add Value" to create options.</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className='d-flex justify-content-end gap-3'>
                        <button type='button' onClick={() => navigate('/attributes-list')} className='btn btn-secondary-600'>
                            Cancel
                        </button>
                        <button type='submit' disabled={loading} className='btn btn-primary-600 d-flex align-items-center gap-2'>
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
                                    {isEditMode ? 'Update Attribute' : 'Create Attribute'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditAttributeLayer;
