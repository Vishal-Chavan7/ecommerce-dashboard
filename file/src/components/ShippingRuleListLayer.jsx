import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const ShippingRuleListLayer = () => {
    const [shippingRules, setShippingRules] = useState([]);
    const [filteredRules, setFilteredRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        fetchShippingRules();
    }, []);

    useEffect(() => {
        filterRules();
    }, [shippingRules, filterStatus, searchTerm]);

    const fetchShippingRules = async () => {
        try {
            setLoading(true);
            console.log('Fetching shipping rules...');
            const response = await api.get('/admin/shipping-rules');
            console.log('Shipping rules response:', response);
            console.log('Shipping rules data:', response.data);
            setShippingRules(response.data.data || []);
            toast.success(`Loaded ${response.data.count || 0} shipping rules`);
        } catch (error) {
            console.error('Error fetching shipping rules:', error);
            console.error('Error details:', error.response);
            toast.error(error.message || 'Failed to fetch shipping rules');
        } finally {
            setLoading(false);
        }
    };

    const filterRules = () => {
        let filtered = [...shippingRules];

        // Filter by status
        if (filterStatus === 'active') {
            filtered = filtered.filter(rule => rule.status === true);
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter(rule => rule.status === false);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(rule =>
                rule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.state?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRules(filtered);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const rule = shippingRules.find(r => r._id === id);
            await api.put(`/admin/shipping-rules/${id}`, {
                ...rule,
                status: !currentStatus
            });

            toast.success(`Shipping rule ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchShippingRules();
        } catch (error) {
            console.error('Error updating shipping rule:', error);
            toast.error('Failed to update shipping rule status');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/admin/shipping-rules/${deleteId}`);
            toast.success('Shipping rule deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchShippingRules();
        } catch (error) {
            console.error('Error deleting shipping rule:', error);
            toast.error('Failed to delete shipping rule');
        }
    };

    const getStats = () => {
        const total = shippingRules.length;
        const active = shippingRules.filter(rule => rule.status === true).length;
        const inactive = shippingRules.filter(rule => rule.status === false).length;
        const freeShipping = shippingRules.filter(rule => rule.shippingCost === 0).length;

        return { total, active, inactive, freeShipping };
    };

    const stats = getStats();

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
        <div className="container-fluid">
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:truck-delivery" width="28" className="text-primary" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Total Rules</p>
                                    <h5 className="mb-0 fw-bold">{stats.total}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:check-circle" width="28" className="text-success" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Active</p>
                                    <h5 className="mb-0 fw-bold">{stats.active}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:close-circle" width="28" className="text-secondary" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Inactive</p>
                                    <h5 className="mb-0 fw-bold">{stats.inactive}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:gift" width="28" className="text-info" />
                                </div>
                                <div className="flex-grow-1 ms-2">
                                    <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>Free Shipping</p>
                                    <h5 className="mb-0 fw-bold">{stats.freeShipping}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <Icon icon="mdi:truck-delivery" className="me-2" />
                        Shipping Rules
                    </h5>
                    <Link to="/add-shipping-rule" className="btn btn-primary btn-sm">
                        <Icon icon="mdi:plus" className="me-1" />
                        Add Shipping Rule
                    </Link>
                </div>
                <div className="card-body">
                    {/* Filters */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <label className="form-label small">Status</label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-8">
                            <label className="form-label small">Search</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <Icon icon="mdi:magnify" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by title, country, or state..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Order Value Range</th>
                                    <th>Shipping Cost</th>
                                    <th>Region</th>
                                    <th>Postal Codes</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRules.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <Icon icon="mdi:truck-off" width="48" className="text-muted mb-2" />
                                            <p className="text-muted mb-0">No shipping rules found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRules.map((rule, index) => (
                                        <tr key={rule._id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center me-2"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: '#e3f2fd'
                                                        }}
                                                    >
                                                        <Icon icon="mdi:truck" className="text-primary" />
                                                    </div>
                                                    <span className="fw-semibold">{rule.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="small">
                                                    <div className="text-muted">Min: ₹{rule.minOrderValue}</div>
                                                    <div className="text-muted">
                                                        Max: {rule.maxOrderValue === Number.MAX_SAFE_INTEGER
                                                            ? 'No Limit'
                                                            : `₹${rule.maxOrderValue}`}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`fw-bold ${rule.shippingCost === 0 ? 'text-success' : 'text-primary'}`}>
                                                    {rule.shippingCost === 0 ? 'FREE' : `₹${rule.shippingCost}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="small">
                                                    <div className="fw-semibold">
                                                        <Icon icon="mdi:flag" className="me-1" />
                                                        {rule.country}
                                                    </div>
                                                    {rule.state && (
                                                        <div className="text-muted">
                                                            <Icon icon="mdi:map-marker" className="me-1" />
                                                            {rule.state}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                {rule.postalCodes && rule.postalCodes.length > 0 ? (
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {rule.postalCodes.slice(0, 2).map((code, idx) => (
                                                            <span key={idx} className="badge bg-light text-dark border">
                                                                {code}
                                                            </span>
                                                        ))}
                                                        {rule.postalCodes.length > 2 && (
                                                            <span className="badge bg-secondary">
                                                                +{rule.postalCodes.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small">All codes</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-2">
                                                    <span
                                                        className={`badge ${rule.status ? 'bg-success' : 'bg-secondary'
                                                            }`}
                                                    >
                                                        {rule.status && <Icon icon="mdi:check-circle" className="me-1" />}
                                                        {rule.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={rule.status}
                                                            onChange={() => handleToggleStatus(rule._id, rule.status)}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <Link
                                                        to={`/edit-shipping-rule/${rule._id}`}
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Edit"
                                                    >
                                                        <Icon icon="mdi:pencil" />
                                                    </Link>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteClick(rule._id)}
                                                        title="Delete"
                                                    >
                                                        <Icon icon="mdi:delete" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
                                <p>Are you sure you want to delete this shipping rule?</p>
                                <p className="text-danger mb-0">This action cannot be undone.</p>
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
                                    onClick={handleDeleteConfirm}
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

export default ShippingRuleListLayer;
