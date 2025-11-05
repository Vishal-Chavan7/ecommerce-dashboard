import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TaxRuleListLayer = () => {
    const [taxRules, setTaxRules] = useState([]);
    const [filteredTaxRules, setFilteredTaxRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, percentage, fixed
    const [filterCountry, setFilterCountry] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTaxRules();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [taxRules, filterType, filterCountry, filterStatus, searchTerm]);

    const fetchTaxRules = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/tax-rules');
            setTaxRules(response.data || []);
        } catch (error) {
            console.error('Error fetching tax rules:', error);
            toast.error('Failed to load tax rules');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...taxRules];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(rule => rule.type === filterType);
        }

        // Filter by country
        if (filterCountry) {
            filtered = filtered.filter(rule => rule.country === filterCountry);
        }

        // Filter by status
        if (filterStatus === 'active') {
            filtered = filtered.filter(rule => rule.status === true);
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter(rule => rule.status === false);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(rule =>
                rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                rule.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (rule.state && rule.state.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredTaxRules(filtered);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/tax-rules/${id}`, { status: !currentStatus });
            toast.success('Tax rule status updated successfully');
            fetchTaxRules();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/admin/tax-rules/${deleteId}`);
            toast.success('Tax rule deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchTaxRules();
        } catch (error) {
            console.error('Error deleting tax rule:', error);
            toast.error('Failed to delete tax rule');
        }
    };

    const getUniqueCountries = () => {
        const countries = [...new Set(taxRules.map(rule => rule.country))];
        return countries.sort();
    };

    const getStats = () => {
        return {
            total: taxRules.length,
            active: taxRules.filter(r => r.status).length,
            inactive: taxRules.filter(r => !r.status).length,
            percentage: taxRules.filter(r => r.type === 'percentage').length,
            fixed: taxRules.filter(r => r.type === 'fixed').length
        };
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
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">
                        <Icon icon="mdi:gavel" className="me-2" />
                        Tax Rules Management
                    </h4>
                    <p className="text-muted mb-0">Manage tax rules for products and categories</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/add-tax-rule')}
                >
                    <Icon icon="mdi:plus" className="me-1" />
                    Add Tax Rule
                </button>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:gavel" width="28" className="text-primary" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Total</p>
                                    <h5 className="mb-0 fw-bold">{stats.total}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:check-circle" width="28" className="text-success" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Active</p>
                                    <h5 className="mb-0 fw-bold">{stats.active}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <Icon icon="mdi:close-circle" width="28" className="text-danger" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Inactive</p>
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
                                    <Icon icon="mdi:percent" width="28" className="text-info" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Percentage</p>
                                    <h5 className="mb-0 fw-bold">{stats.percentage}</h5>
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
                                    <Icon icon="mdi:currency-inr" width="28" className="text-warning" />
                                </div>
                                <div className="flex-grow-1 ms-2 overflow-hidden">
                                    <p className="mb-1 text-muted" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>Fixed</p>
                                    <h5 className="mb-0 fw-bold">{stats.fixed}</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:filter" className="me-1" />
                                Filter by Type
                            </label>
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:earth" className="me-1" />
                                Filter by Country
                            </label>
                            <select
                                className="form-select"
                                value={filterCountry}
                                onChange={(e) => setFilterCountry(e.target.value)}
                            >
                                <option value="">All Countries</option>
                                {getUniqueCountries().map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:toggle-switch" className="me-1" />
                                Filter by Status
                            </label>
                            <select
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        <div className="col-md-3">
                            <label className="form-label small">
                                <Icon icon="mdi:magnify" className="me-1" />
                                Search
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name, country..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Rules Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">
                            Tax Rules List ({filteredTaxRules.length} {filteredTaxRules.length === 1 ? 'rule' : 'rules'})
                        </h6>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={fetchTaxRules}
                        >
                            <Icon icon="mdi:refresh" className="me-1" />
                            Refresh
                        </button>
                    </div>

                    {filteredTaxRules.length === 0 ? (
                        <div className="text-center py-5">
                            <Icon icon="mdi:gavel-off" width="64" className="text-muted mb-3" />
                            <p className="text-muted">No tax rules found</p>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => navigate('/add-tax-rule')}
                            >
                                <Icon icon="mdi:plus" className="me-1" />
                                Create First Tax Rule
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '25%' }}>
                                            <Icon icon="mdi:label" className="me-1" />
                                            Rule Name
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:format-list-bulleted-type" className="me-1" />
                                            Type
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:calculator" className="me-1" />
                                            Value
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:earth" className="me-1" />
                                            Country
                                        </th>
                                        <th style={{ width: '12%' }}>
                                            <Icon icon="mdi:map-marker" className="me-1" />
                                            State/Region
                                        </th>
                                        <th style={{ width: '15%' }}>
                                            <Icon icon="mdi:toggle-switch" className="me-1" />
                                            Status
                                        </th>
                                        <th className="text-end" style={{ width: '12%' }}>
                                            <Icon icon="mdi:cog" className="me-1" />
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTaxRules.map((rule) => (
                                        <tr key={rule._id} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className={`rounded-circle p-2 ${rule.type === 'percentage' ? 'bg-info' : 'bg-warning'} bg-opacity-10 me-3`}>
                                                        <Icon
                                                            icon={rule.type === 'percentage' ? 'mdi:percent' : 'mdi:currency-inr'}
                                                            width="20"
                                                            className={rule.type === 'percentage' ? 'text-info' : 'text-warning'}
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="fw-semibold text-dark">{rule.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${rule.type === 'percentage' ? 'bg-info' : 'bg-warning text-dark'}`}>
                                                    <Icon icon={rule.type === 'percentage' ? 'mdi:percent' : 'mdi:currency-inr'} className="me-1" />
                                                    {rule.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={`badge ${rule.type === 'percentage' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} fs-6 px-3 py-2`}>
                                                    <strong>
                                                        {rule.type === 'percentage' ? `${rule.value}%` : `₹${rule.value.toFixed(2)}`}
                                                    </strong>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary">
                                                        <Icon icon="mdi:flag" className="me-1" />
                                                        {rule.country}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {rule.state ? (
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">
                                                        <Icon icon="mdi:map-marker" className="me-1" />
                                                        {rule.state}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted fst-italic">National</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className={`badge ${rule.status ? 'bg-success' : 'bg-secondary'}`}>
                                                        <Icon
                                                            icon={rule.status ? 'mdi:check-circle' : 'mdi:close-circle'}
                                                            className="me-1"
                                                        />
                                                        {rule.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className="form-check form-switch mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            checked={rule.status}
                                                            onChange={() => handleToggleStatus(rule._id, rule.status)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => navigate(`/edit-tax-rule/${rule._id}`)}
                                                        title="Edit Tax Rule"
                                                    >
                                                        <Icon icon="mdi:pencil" width="16" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteClick(rule._id)}
                                                        title="Delete Tax Rule"
                                                    >
                                                        <Icon icon="mdi:delete" width="16" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title">
                                    <Icon icon="mdi:alert-circle" className="text-warning me-2" />
                                    Confirm Delete
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">Are you sure you want to delete this tax rule? This action cannot be undone.</p>
                                <div className="alert alert-warning mt-3 mb-0">
                                    <Icon icon="mdi:information" className="me-2" />
                                    <small>Products using this tax rule may need to be updated.</small>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
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
                                    onClick={confirmDelete}
                                >
                                    <Icon icon="mdi:delete" className="me-1" />
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

export default TaxRuleListLayer;
