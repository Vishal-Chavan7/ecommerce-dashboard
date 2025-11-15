import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const ProductsListLayer = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchBrands();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.get('/admin/brands');
            setBrands(response.data.filter(b => b.status));
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            setCategories(response.data.filter(c => c.status));
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/products/${deleteId}`);
            toast.success('Product deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/products/${id}`, { status: !currentStatus });
            toast.success('Status updated successfully');
            fetchProducts();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBrand = filterBrand === 'all' || product.brandId?._id === filterBrand;
        const matchesCategory = filterCategory === 'all' ||
            product.categoryIds?.some(cat => cat._id === filterCategory);
        const matchesType = filterType === 'all' || product.type === filterType;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && product.status) ||
            (filterStatus === 'inactive' && !product.status);

        return matchesSearch && matchesBrand && matchesCategory && matchesType && matchesStatus;
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
                            <select className='form-select form-select-sm pt-1 w-auto'>
                                <option value='10'>10</option>
                                <option value='25'>25</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>
                            </select>
                        </div>

                        <select
                            className='form-select form-select-sm pt-1 w-auto'
                            value={filterBrand}
                            onChange={(e) => setFilterBrand(e.target.value)}
                        >
                            <option value='all'>All Brands</option>
                            {brands.map(brand => (
                                <option key={brand._id} value={brand._id}>{brand.name}</option>
                            ))}
                        </select>

                        <select
                            className='form-select form-select-sm w-auto pt-1'
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value='all'>All Categories</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>{category.name}</option>
                            ))}
                        </select>

                        <select
                            className='form-select form-select-sm w-auto pt-1'
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value='all'>All Types</option>
                            <option value='simple'>Simple</option>
                            <option value='variable'>Variable</option>
                        </select>

                        <select
                            className='form-select form-select-sm pt-1 w-auto'
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
                                placeholder='Search products...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className='icon'>
                                <Icon icon='ion:search-outline' />
                            </span>
                        </div>

                        <button
                            className='btn btn-primary-600 btn-sm'
                            onClick={() => navigate('/add-product')}
                        >
                            <Icon icon='ph:plus' className='me-1' />
                            Add New Product
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
                                    <th scope='col'>Image</th>
                                    <th scope='col'>Title</th>
                                    <th scope='col'>SKU</th>
                                    <th scope='col'>Brand</th>
                                    <th scope='col'>Type</th>
                                    <th scope='col'>Status</th>
                                    <th scope='col' className='text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan='8' className='text-center py-4'>
                                            <div className='d-flex flex-column align-items-center gap-2'>
                                                <Icon icon='mdi:package-variant-closed-remove' className='text-secondary-light' style={{ fontSize: '48px' }} />
                                                <p className='mb-0 text-secondary-light'>No products found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product._id}>
                                            <td>
                                                <div className='form-check'>
                                                    <input className='form-check-input' type='checkbox' />
                                                </div>
                                            </td>
                                            <td>
                                                {product.thumbnail ? (
                                                    <img src={product.thumbnail} alt={product.title} className='rounded' style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className='bg-neutral-200 rounded d-flex align-items-center justify-content-center' style={{ width: '50px', height: '50px' }}>
                                                        <Icon icon='mdi:image-off' className='text-secondary-light' />
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>
                                                    <span className='text-primary-600 fw-medium d-block'>{product.title}</span>
                                                    <small className='text-secondary-light'>{product.slug}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <code className='text-secondary-light'>{product.sku}</code>
                                            </td>
                                            <td>
                                                {product.brandId ? (
                                                    <span className='badge bg-info-100 text-info-600 text-sm'>
                                                        {product.brandId.name}
                                                    </span>
                                                ) : (
                                                    <span className='text-secondary-light'>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge text-sm text-capitalize ${product.type === 'simple' ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'}`}>
                                                    {product.type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className='d-flex align-items-center gap-3'>
                                                    <span className={`badge px-3 py-1 ${product.status ? 'bg-success-600 text-white' : 'bg-neutral-400 text-white'}`}>
                                                        {product.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className='form-check form-switch m-0'>
                                                        <input
                                                            className='form-check-input cursor-pointer shadow-none'
                                                            type='checkbox'
                                                            role='switch'
                                                            checked={product.status}
                                                            onChange={() => handleToggleStatus(product._id, product.status)}
                                                            style={{
                                                                width: '48px',
                                                                height: '24px',
                                                                backgroundColor: product.status ? '#10b981' : '#d1d5db',
                                                                borderColor: product.status ? '#10b981' : '#d1d5db',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='text-center'>
                                                <div className='d-flex align-items-center gap-2 justify-content-center'>
                                                    <button
                                                        className='btn btn-sm btn-outline-primary-600'
                                                        onClick={() => navigate(`/edit-product/${product._id}`)}
                                                        title='Edit'
                                                    >
                                                        <Icon icon='lucide:edit' />
                                                    </button>
                                                    <button
                                                        className='btn btn-sm btn-outline-danger-600'
                                                        onClick={() => {
                                                            setDeleteId(product._id);
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
                            Showing {filteredProducts.length} of {products.length} entries
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
                                <p>Are you sure you want to delete this product? This action cannot be undone.</p>
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

export default ProductsListLayer;
