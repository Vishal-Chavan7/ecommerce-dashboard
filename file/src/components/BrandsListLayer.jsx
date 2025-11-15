import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const BrandsListLayer = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/brands');
            setBrands(response.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/brands/${deleteId}`);
            toast.success('Brand deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchBrands();
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Failed to delete brand');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/brands/${id}`, { status: !currentStatus });
            toast.success('Status updated successfully');
            fetchBrands();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleToggleFeatured = async (id, currentFeatured) => {
        try {
            await api.put(`/admin/brands/${id}`, { isFeatured: !currentFeatured });
            toast.success('Featured status updated successfully');
            fetchBrands();
        } catch (error) {
            console.error('Error updating featured status:', error);
            toast.error('Failed to update featured status');
        }
    };

    const filteredBrands = brands.filter(brand => {
        const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.slug.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && brand.status) ||
            (filterStatus === 'inactive' && !brand.status);

        return matchesSearch && matchesStatus;
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
                            <select className='form-select form-select-sm  p-1  w-auto'>
                                <option className='m-2' value='10'>10</option>
                                <option className='m-2' value='25'>25</option>
                                <option className='m-2' value='50'>50</option>
                                <option className='m-2' value='100'>100</option>
                            </select>
                            <span>entries</span>
                        </div>

                        <select
                            className='form-select form-select-sm  p-1 w-auto'
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value='all'>All Status</option>
                            <option value='active'>Active Only</option>
                            <option value='inactive'>Inactive Only</option>
                        </select>
                    </div>

                    <div className='d-flex flex-wrap align-items-center gap-3'>
                        <div className='icon-field'>
                            <input
                                type='text'
                                className='form-control form-control-sm w-auto'
                                placeholder='Search brands...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className='icon'>
                                <Icon icon='ion:search-outline' />
                            </span>
                        </div>

                        <button
                            className='btn btn-primary-600 btn-sm'
                            onClick={() => navigate('/add-brand')}
                        >
                            <Icon icon='ph:plus' className='me-1' />
                            Add New Brand
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
                                    <th scope='col'>Logo</th>
                                    <th scope='col'>Brand Name</th>
                                    <th scope='col'>Status</th>
                                    <th scope='col' className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBrands.length === 0 ? (
                                    <tr>
                                        <td colSpan='5' className='text-center py-4'>
                                            <div className='d-flex flex-column align-items-center gap-2'>
                                                <Icon icon='mdi:store-off-outline' className='text-secondary-light' style={{ fontSize: '48px' }} />
                                                <p className='mb-0 text-secondary-light'>No brands found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBrands.map((brand) => (
                                        <tr key={brand._id}>
                                            <td>
                                                <div className='form-check'>
                                                    <input className='form-check-input' type='checkbox' />
                                                </div>
                                            </td>
                                            <td>
                                                {brand.logo ? (
                                                    <img
                                                        src={brand.logo.startsWith('http') ? brand.logo : `http://localhost:5000${brand.logo}`}
                                                        alt={brand.name}
                                                        className='rounded-circle border'
                                                        style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            objectFit: 'cover',
                                                            padding: '4px',
                                                            backgroundColor: '#fff'
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className='bg-neutral-100 rounded-circle border d-flex align-items-center justify-content-center'
                                                        style={{ width: '48px', height: '48px' }}
                                                    >
                                                        <Icon icon='mdi:store' className='text-neutral-400' style={{ fontSize: '24px' }} />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className='d-flex flex-column'>
                                                    <span className='text-dark fw-semibold mb-1'>{brand.name}</span>
                                                    <code className='text-secondary-light text-xs'>{brand.slug}</code>
                                                </div>
                                            </td>
                                            <td>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <div className='form-check form-switch'>
                                                        <input
                                                            className='form-check-input'
                                                            type='checkbox'
                                                            role='switch'
                                                            checked={brand.status}
                                                            onChange={() => handleToggleStatus(brand._id, brand.status)}
                                                            style={{ width: '44px', height: '24px', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                    <span className={`badge text-sm px-2 py-1 ${brand.status ? 'bg-success-600 text-white' : 'bg-secondary-200 text-secondary-600'}`}>
                                                        {brand.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className='text-center'>
                                                <div className='d-flex align-items-center gap-2 justify-content-center'>
                                                    <button
                                                        className='btn btn-sm btn-primary-600 d-flex align-items-center gap-1'
                                                        onClick={() => navigate(`/edit-brand/${brand._id}`)}
                                                        title='Edit Brand'
                                                    >
                                                        <Icon icon='lucide:edit' className='text-lg' />
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-danger-600 d-flex align-items-center gap-1'
                                                        onClick={() => {
                                                            setDeleteId(brand._id);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title='Delete Brand'
                                                    >
                                                        <Icon icon='fluent:delete-24-regular' className='text-lg' />
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
                            Showing {filteredBrands.length} of {brands.length} entries
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
                                <p>Are you sure you want to delete this brand? This action cannot be undone.</p>
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

export default BrandsListLayer;
