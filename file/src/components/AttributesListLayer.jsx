import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AttributesListLayer = () => {
    const navigate = useNavigate();
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchAttributes();
    }, []);

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/attributes');
            setAttributes(response.data);
        } catch (error) {
            console.error('Error fetching attributes:', error);
            toast.error('Failed to load attributes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/attributes/${deleteId}`);
            toast.success('Attribute deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchAttributes();
        } catch (error) {
            console.error('Error deleting attribute:', error);
            toast.error('Failed to delete attribute');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/attributes/${id}`, { status: !currentStatus });
            toast.success('Status updated successfully');
            fetchAttributes();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredAttributes = attributes.filter(attr => {
        const matchesSearch = attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attr.slug.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === 'all' ||
            (filterType === 'filter' && attr.isFilter) ||
            (filterType === 'attribute' && !attr.isFilter);

        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
                <div className='spinner-border text-primary-600' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='card'>
                <div className='card-header d-flex flex-wrap align-items-center justify-content-between gap-3'>
                    <div className='d-flex flex-wrap align-items-center gap-3'>
                        <div className='d-flex align-items-center gap-2'>
                            <span style={{ fontSize: '15px', minWidth: 'fit-content' }}>Show</span>
                            <select className='form-select form-select-sm' style={{ width: 'auto', minWidth: '70px', fontSize: '15px', padding: '8px 12px' }}>
                                <option value='10'>10</option>
                                <option value='25'>25</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>
                            </select>
                            <span style={{ fontSize: '15px', minWidth: 'fit-content' }}>entries</span>
                        </div>

                        <select
                            className='form-select form-select-sm'
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ width: 'auto', minWidth: '150px', fontSize: '15px', padding: '8px 12px' }}
                        >
                            <option value='all'>All Types</option>
                            <option value='attribute'>Attributes Only</option>
                            <option value='filter'>Filters Only</option>
                        </select>
                    </div>

                    <div className='d-flex flex-wrap align-items-center gap-3'>
                        <div className='icon-field'>
                            <input
                                type='text'
                                className='form-control form-control-sm'
                                placeholder='Search...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: 'auto', minWidth: '200px', fontSize: '15px', padding: '8px 12px 8px 40px' }}
                            />
                            <span className='icon'>
                                <Icon icon='ion:search-outline' />
                            </span>
                        </div>

                        <button
                            className='btn btn-primary-600 btn-sm d-flex align-items-center'
                            onClick={() => navigate('/add-attribute')}
                            style={{ fontSize: '15px', padding: '8px 16px', minWidth: 'fit-content' }}
                        >
                            <Icon icon='ph:plus' className='me-1' style={{ fontSize: '18px' }} />
                            Add New Attribute
                        </button>
                    </div>
                </div>

                <div className='card-body'>
                    <div className='table-responsive'>
                        <table className='table bordered-table mb-0'>
                            <thead>
                                <tr style={{ fontSize: '15px' }}>
                                    <th scope='col' style={{ width: '50px' }}>
                                        <div className='form-check'>
                                            <input className='form-check-input' type='checkbox' />
                                        </div>
                                    </th>
                                    <th scope='col' className='fw-semibold'>Name</th>
                                    <th scope='col' className='fw-semibold'>Slug</th>
                                    <th scope='col' className='fw-semibold'>Type</th>
                                    <th scope='col' className='fw-semibold'>Values Count</th>
                                    <th scope='col' className='fw-semibold'>Status</th>
                                    <th scope='col' className='text-center fw-semibold'>Action</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '15px' }}>
                                {filteredAttributes.length === 0 ? (
                                    <tr>
                                        <td colSpan='7' className='text-center py-4'>
                                            <div className='d-flex flex-column align-items-center gap-2'>
                                                <Icon icon='mdi:filter-off-outline' className='text-secondary-light' style={{ fontSize: '48px' }} />
                                                <p className='mb-0 text-secondary-light' style={{ fontSize: '15px' }}>No attributes found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttributes.map((attr) => (
                                        <tr key={attr._id}>
                                            <td>
                                                <div className='form-check'>
                                                    <input className='form-check-input' type='checkbox' />
                                                </div>
                                            </td>
                                            <td>
                                                <span className='text-primary-600 fw-medium' style={{ fontSize: '15px' }}>{attr.name}</span>
                                            </td>
                                            <td>
                                                <code className='text-secondary-light' style={{ fontSize: '14px' }}>{attr.slug}</code>
                                            </td>
                                            <td>
                                                <span className='badge text-capitalize' style={{
                                                    backgroundColor: attr.type === 'select' ? '#e0f2fe' : attr.type === 'multiselect' ? '#e0e7ff' : '#fef3c7',
                                                    color: attr.type === 'select' ? '#0369a1' : attr.type === 'multiselect' ? '#4338ca' : '#b45309',
                                                    fontSize: '13px'
                                                }}>
                                                    {attr.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className='badge bg-neutral-200 text-neutral-900' style={{ fontSize: '13px' }}>
                                                    {attr.values?.length || 0} values
                                                </span>
                                            </td>
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <div className='form-switch switch-primary d-flex align-items-center gap-3'>
                                                        <input
                                                            className='form-check-input'
                                                            type='checkbox'
                                                            role='switch'
                                                            checked={attr.status}
                                                            onChange={() => handleToggleStatus(attr._id, attr.status)}
                                                        />
                                                    </div>
                                                    <span className={`badge px-2 py-1 ${attr.status ? 'bg-success-600 text-white' : 'bg-secondary-200 text-secondary-600'}`} style={{ fontSize: '13px', minWidth: '70px' }}>
                                                        {attr.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='text-center'>
                                                <div className='d-flex align-items-center gap-2 justify-content-center'>
                                                    <button
                                                        className='btn btn-sm btn-outline-primary-600 d-flex align-items-center justify-content-center'
                                                        onClick={() => navigate(`/edit-attribute/${attr._id}`)}
                                                        title='Edit'
                                                        style={{ padding: '8px 14px' }}
                                                    >
                                                        <Icon icon='lucide:edit' style={{ fontSize: '18px' }} />
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-outline-danger-600 d-flex align-items-center justify-content-center'
                                                        onClick={() => {
                                                            setDeleteId(attr._id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title='Delete'
                                                        style={{ padding: '8px 14px' }}
                                                    >
                                                        <Icon icon='fluent:delete-24-regular' style={{ fontSize: '18px' }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3'>
                        <span className='text-secondary-light' style={{ fontSize: '15px', minWidth: 'fit-content' }}>
                            Showing {filteredAttributes.length} of {attributes.length} entries
                        </span>
                        <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center mb-0'>
                            <li className='page-item'>
                                <a className='page-link bg-neutral-200 text-secondary-light fw-medium radius-8 border-0 d-flex align-items-center justify-content-center' style={{ width: '36px', height: '36px', padding: '8px' }} href='#'>
                                    <Icon icon='ep:d-arrow-left' style={{ fontSize: '18px' }} />
                                </a>
                            </li>
                            <li className='page-item'>
                                <a className='page-link text-white fw-medium radius-8 border-0 bg-primary-600 d-flex align-items-center justify-content-center' style={{ width: '36px', height: '36px', padding: '8px', fontSize: '15px' }} href='#'>1</a>
                            </li>
                            <li className='page-item'>
                                <a className='page-link bg-neutral-200 text-secondary-light fw-medium radius-8 border-0 d-flex align-items-center justify-content-center' style={{ width: '36px', height: '36px', padding: '8px', fontSize: '15px' }} href='#'>2</a>
                            </li>
                            <li className='page-item'>
                                <a className='page-link bg-neutral-200 text-secondary-light fw-medium radius-8 border-0 d-flex align-items-center justify-content-center' style={{ width: '36px', height: '36px', padding: '8px' }} href='#'>
                                    <Icon icon='ep:d-arrow-right' style={{ fontSize: '18px' }} />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog modal-dialog-centered'>
                        <div className='modal-content'>
                            <div className='modal-header border-0'>
                                <h5 className='modal-title' style={{ fontSize: '19px' }}>Confirm Delete</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                ></button>
                            </div>
                            <div className='modal-body text-center py-4'>
                                <Icon icon='mdi:alert-circle' style={{ fontSize: '64px', color: '#dc3545' }} />
                                <h5 className='mt-3' style={{ fontSize: '19px' }}>Are you sure?</h5>
                                <p style={{ fontSize: '15px' }}>Are you sure you want to delete this attribute? This action cannot be undone.</p>
                            </div>
                            <div className='modal-footer border-0 justify-content-center gap-2'>
                                <button
                                    type='button'
                                    className='btn btn-secondary-600 d-flex align-items-center px-4 py-2'
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                    style={{ fontSize: '15px' }}
                                >
                                    <Icon icon='mdi:close' className='me-2' style={{ fontSize: '20px' }} />
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-danger-600 d-flex align-items-center px-4 py-2'
                                    onClick={handleDelete}
                                    style={{ fontSize: '15px' }}
                                >
                                    <Icon icon='fluent:delete-24-regular' className='me-2' style={{ fontSize: '20px' }} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AttributesListLayer;
