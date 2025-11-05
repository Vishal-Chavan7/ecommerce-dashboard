import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddressListLayer = () => {
    const [addresses, setAddresses] = useState([]);
    const [filteredAddresses, setFilteredAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Get userId from localStorage (assuming user is logged in)
    const getUserId = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            return userData._id || userData.id;
        }
        return null;
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        filterAddresses();
    }, [addresses, filterType, searchTerm]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const userId = getUserId();
            if (!userId) {
                toast.error('Please log in to view addresses');
                return;
            }
            const response = await api.get(`/user/addresses?userId=${userId}`);
            setAddresses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const filterAddresses = () => {
        let filtered = [...addresses];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(addr => addr.type === filterType);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(addr =>
                addr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                addr.phone?.includes(searchTerm)
            );
        }

        setFilteredAddresses(filtered);
    };

    const handleSetDefault = async (id) => {
        try {
            // First, set all addresses to non-default
            const userId = getUserId();
            const allAddresses = await api.get(`/user/addresses?userId=${userId}`);

            // Update the selected address to default
            await api.put(`/user/addresses/${id}`, {
                isDefault: true
            });

            // Set others to false
            for (const addr of allAddresses.data.data) {
                if (addr._id !== id && addr.isDefault) {
                    await api.put(`/user/addresses/${addr._id}`, {
                        isDefault: false
                    });
                }
            }

            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Failed to set default address');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/user/addresses/${deleteId}`);
            toast.success('Address deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    // Stats calculations
    const stats = {
        total: addresses.length,
        home: addresses.filter(addr => addr.type === 'home').length,
        office: addresses.filter(addr => addr.type === 'office').length,
        default: addresses.filter(addr => addr.isDefault).length
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-body">
                {/* Header with Add Button */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0">My Addresses</h5>
                    <Link to="/add-address" className="btn btn-primary">
                        <Icon icon="mdi:plus" className="me-1" />
                        Add New Address
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 bg-primary-subtle">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <Icon icon="mdi:map-marker" width="40" className="text-primary" />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{stats.total}</h3>
                                        <p className="text-muted mb-0">Total Addresses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-success-subtle">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <Icon icon="mdi:home" width="40" className="text-success" />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{stats.home}</h3>
                                        <p className="text-muted mb-0">Home Addresses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-info-subtle">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <Icon icon="mdi:office-building" width="40" className="text-info" />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{stats.office}</h3>
                                        <p className="text-muted mb-0">Office Addresses</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-warning-subtle">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <Icon icon="mdi:star" width="40" className="text-warning" />
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <h3 className="mb-0">{stats.default}</h3>
                                        <p className="text-muted mb-0">Default Address</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <select
                            className="form-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="home">Home</option>
                            <option value="office">Office</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name, address, city, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Addresses Grid */}
                {filteredAddresses.length === 0 ? (
                    <div className="text-center py-5">
                        <Icon icon="mdi:map-marker-off" width="64" className="text-muted mb-3" />
                        <h5 className="text-muted">No addresses found</h5>
                        <p className="text-muted">Add your first address to get started</p>
                        <Link to="/add-address" className="btn btn-primary">
                            <Icon icon="mdi:plus" className="me-1" />
                            Add Address
                        </Link>
                    </div>
                ) : (
                    <div className="row g-3">
                        {filteredAddresses.map((address) => (
                            <div key={address._id} className="col-md-6 col-lg-4">
                                <div className={`card h-100 ${address.isDefault ? 'border-primary' : ''}`}>
                                    <div className="card-body">
                                        {/* Address Type Badge */}
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <span className={`badge ${address.type === 'home' ? 'bg-success' : 'bg-info'}`}>
                                                <Icon icon={address.type === 'home' ? 'mdi:home' : 'mdi:office-building'} className="me-1" />
                                                {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                            </span>
                                            {address.isDefault && (
                                                <span className="badge bg-warning text-dark">
                                                    <Icon icon="mdi:star" className="me-1" />
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        {/* Name and Phone */}
                                        <h6 className="mb-2">
                                            <Icon icon="mdi:account" className="me-2 text-primary" />
                                            {address.name}
                                        </h6>
                                        <p className="mb-2 text-muted">
                                            <Icon icon="mdi:phone" className="me-2" />
                                            {address.phone}
                                        </p>

                                        {/* Address */}
                                        <div className="mb-3">
                                            <p className="mb-1 small text-muted">
                                                <Icon icon="mdi:map-marker" className="me-2" />
                                                {address.address}
                                            </p>
                                            <p className="mb-0 small text-muted ms-4">
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                            <p className="mb-0 small text-muted ms-4">
                                                {address.country}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="d-flex gap-2">
                                            {!address.isDefault && (
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => handleSetDefault(address._id)}
                                                    title="Set as default"
                                                >
                                                    <Icon icon="mdi:star" />
                                                </button>
                                            )}
                                            <Link
                                                to={`/edit-address/${address._id}`}
                                                className="btn btn-sm btn-outline-primary flex-grow-1"
                                            >
                                                <Icon icon="mdi:pencil" className="me-1" />
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => openDeleteModal(address._id)}
                                            >
                                                <Icon icon="mdi:delete" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this address?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressListLayer;
