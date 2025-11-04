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
                            <span>Show</span>
                            <select className='form-select form-select-sm w-auto'>
                                <option value='10'>10</option>
                                <option value='25'>25</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>
                            </select>
                            <span>entries</span>
                        </div>

                        <select
                            className='form-select form-select-sm w-auto'
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
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
                                className='form-control form-control-sm w-auto'
                                placeholder='Search...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className='icon'>
                                <Icon icon='ion:search-outline' />
                            </span>
                        </div>

                        <button
                            className='btn btn-primary-600 btn-sm'
                            onClick={() => navigate('/add-attribute')}
                        >
                            <Icon icon='ph:plus' className='me-1' />
                            Add New Attribute
                        </button>
                    </div>
                </div>

                <div className='card-body'>
                    <div className='table-responsive'>
                        <table className='table bordered-table mb-0'>
                            <thead>
                                <tr>
                                    <th scope='col'>
                                        <div className='form-check'>
                                            <input className='form-check-input' type='checkbox' />
                                        </div>
                                    </th>
                                    <th scope='col'>Name</th>
                                    <th scope='col'>Slug</th>
                                    <th scope='col'>Type</th>
                                    <th scope='col'>Values Count</th>
                                    <th scope='col'>Is Filter</th>
                                    <th scope='col'>Status</th>
                                    <th scope='col' className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttributes.length === 0 ? (
                                    <tr>
                                        <td colSpan='8' className='text-center py-4'>
                                            <div className='d-flex flex-column align-items-center gap-2'>
                                                <Icon icon='mdi:filter-off-outline' className='text-secondary-light' style={{ fontSize: '48px' }} />
                                                <p className='mb-0 text-secondary-light'>No attributes found</p>
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
                                                <span className='text-primary-600 fw-medium'>{attr.name}</span>
                                            </td>
                                            <td>
                                                <code className='text-secondary-light'>{attr.slug}</code>
                                            </td>
                                            <td>
                                                <span className='badge text-sm text-capitalize' style={{
                                                    backgroundColor: attr.type === 'select' ? '#e0f2fe' : attr.type === 'multiselect' ? '#e0e7ff' : '#fef3c7',
                                                    color: attr.type === 'select' ? '#0369a1' : attr.type === 'multiselect' ? '#4338ca' : '#b45309'
                                                }}>
                                                    {attr.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className='badge bg-neutral-200 text-neutral-900 text-sm'>
                                                    {attr.values?.length || 0} values
                                                </span>
                                            </td>
                                            <td>
                                                {attr.isFilter ? (
                                                    <span className='badge bg-success-100 text-success-600 text-sm'>
                                                        <Icon icon='mdi:filter-check' className='me-1' />
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className='badge bg-neutral-200 text-neutral-600 text-sm'>
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className='form-check form-switch'>
                                                    <input
                                                        className='form-check-input'
                                                        type='checkbox'
                                                        role='switch'
                                                        checked={attr.status}
                                                        onChange={() => handleToggleStatus(attr._id, attr.status)}
                                                    />
                                                </div>
                                            </td>
                                            <td className='text-center'>
                                                <div className='d-flex align-items-center gap-2 justify-content-center'>
                                                    <button
                                                        className='btn btn-sm btn-outline-primary-600'
                                                        onClick={() => navigate(/edit-attribute/)}
                                                        title='Edit'
                                                    >
                                                        <Icon icon='lucide:edit' />
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-outline-danger-600'
                                                        onClick={() => {
                                                            setDeleteId(attr._id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title='Delete'
                                                    >
                                                        <Icon icon='fluent:delete-24-regular' />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3'>
                        <span className='text-secondary-light'>
                            Showing {filteredAttributes.length} of {attributes.length} entries
                        </span>
                        <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
                            <li className='page-item'>
                                <a className='page-link bg-neutral-200 text-secondary-light fw-medium radius-8 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px' href='#'>
                                    <Icon icon='ep:d-arrow-left' />
                                </a>
                            </li>
                            <li className='page-item'>
                                <a className='page-link text-secondary-light fw-medium radius-8 border-0 px-10 py-10 bg-primary-600 text-white d-flex align-items-center justify-content-center h-32-px' href='#'>1</a>
                            </li>
                            <li className='page-item'>
                                <a className='page-link bg-neutral-200 text-secondary-light fw-medium radius-8 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px' href='#'>2</a>
                            </li>
                            <li className='page-item'>
                                <a className='page-link bg-neutral-200 text-secondary-light fw-medium radius-8 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px' href='#'>
                                    <Icon icon='ep:d-arrow-right' />
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
                            <div className='modal-header'>
                                <h5 className='modal-title'>Confirm Delete</h5>
                                <button
                                    type='button'
                                    className='btn-close'
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                ></button>
                            </div>
                            <div className='modal-body'>
                                <p>Are you sure you want to delete this attribute? This action cannot be undone.</p>
                            </div>
                            <div className='modal-footer'>
                                <button
                                    type='button'
                                    className='btn btn-secondary-600'
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-danger-600'
                                    onClick={handleDelete}
                                >
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
