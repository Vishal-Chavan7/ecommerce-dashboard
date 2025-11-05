import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const AddEditAddressLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        type: 'home',
        isDefault: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Indian states list
    const indianStates = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];

    // Get userId from localStorage
    const getUserId = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            return userData._id || userData.id;
        }
        return null;
    };

    useEffect(() => {
        if (isEditMode) {
            fetchAddress();
        }
    }, [id]);

    const fetchAddress = async () => {
        try {
            const response = await api.get(`/user/addresses/${id}`);
            const address = response.data.data;
            setFormData({
                name: address.name || '',
                phone: address.phone || '',
                address: address.address || '',
                city: address.city || '',
                state: address.state || '',
                pincode: address.pincode || '',
                country: address.country || 'India',
                type: address.type || 'home',
                isDefault: address.isDefault || false
            });
        } catch (error) {
            console.error('Error fetching address:', error);
            toast.error('Failed to fetch address');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!formData.state) {
            newErrors.state = 'State is required';
        }

        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }

        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix all validation errors');
            return;
        }

        try {
            setLoading(true);
            const userId = getUserId();
            if (!userId) {
                toast.error('Please log in to continue');
                navigate('/sign-in');
                return;
            }

            const payload = {
                ...formData,
                userId
            };

            if (isEditMode) {
                await api.put(`/user/addresses/${id}`, payload);
                toast.success('Address updated successfully');
            } else {
                await api.post('/user/addresses', payload);
                toast.success('Address added successfully');
            }

            navigate('/addresses-list');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error(error.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="row">
            <div className="col-lg-8">
                <div className="card">
                    <div className="card-body">
                        <h5 className="mb-4">
                            <Icon icon="mdi:map-marker" className="me-2" />
                            {isEditMode ? 'Edit Address' : 'Add New Address'}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            {/* Contact Information */}
                            <div className="card border mb-4">
                                <div className="card-header bg-light">
                                    <h6 className="mb-0">Contact Information</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Full Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Phone Number <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="10 digit mobile number"
                                                maxLength={10}
                                            />
                                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div className="card border mb-4">
                                <div className="card-header bg-light">
                                    <h6 className="mb-0">Address Details</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">
                                                Address <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows={3}
                                                placeholder="House No., Building Name, Road Name, Area"
                                            />
                                            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                City <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                placeholder="Enter city"
                                            />
                                            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                State <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                            >
                                                <option value="">Select State</option>
                                                {indianStates.map((state) => (
                                                    <option key={state} value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Pincode <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                placeholder="6 digit pincode"
                                                maxLength={6}
                                            />
                                            {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Country <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                                name="country"
                                                value={formData.country}
                                                onChange={handleChange}
                                                readOnly
                                            />
                                            {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Type */}
                            <div className="card border mb-4">
                                <div className="card-header bg-light">
                                    <h6 className="mb-0">Address Type</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div
                                                className={`card cursor-pointer ${formData.type === 'home' ? 'border-success' : 'border'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, type: 'home' }))}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="card-body text-center">
                                                    <Icon icon="mdi:home" width="48" className={formData.type === 'home' ? 'text-success' : 'text-muted'} />
                                                    <h6 className="mt-2 mb-0">Home</h6>
                                                    <small className="text-muted">Delivery to home address</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div
                                                className={`card cursor-pointer ${formData.type === 'office' ? 'border-info' : 'border'}`}
                                                onClick={() => setFormData(prev => ({ ...prev, type: 'office' }))}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="card-body text-center">
                                                    <Icon icon="mdi:office-building" width="48" className={formData.type === 'office' ? 'text-info' : 'text-muted'} />
                                                    <h6 className="mt-2 mb-0">Office</h6>
                                                    <small className="text-muted">Delivery to office address</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Default Address Checkbox */}
                            <div className="card border mb-4">
                                <div className="card-body">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="isDefault"
                                            id="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="isDefault">
                                            <Icon icon="mdi:star" className="text-warning me-1" />
                                            Set as default address
                                        </label>
                                        <small className="d-block text-muted ms-4">
                                            This address will be selected by default during checkout
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/addresses-list')}
                                    disabled={loading}
                                >
                                    <Icon icon="mdi:arrow-left" className="me-1" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon="mdi:content-save" className="me-1" />
                                            {isEditMode ? 'Update Address' : 'Save Address'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Preview Sidebar */}
            <div className="col-lg-4">
                <div className="card sticky-top" style={{ top: '20px' }}>
                    <div className="card-header bg-primary text-white">
                        <h6 className="mb-0">
                            <Icon icon="mdi:eye" className="me-2" />
                            Address Preview
                        </h6>
                    </div>
                    <div className="card-body">
                        {formData.name && (
                            <div className="mb-3">
                                <strong className="d-block mb-1">
                                    <Icon icon="mdi:account" className="me-2 text-primary" />
                                    {formData.name}
                                </strong>
                                {formData.phone && (
                                    <small className="text-muted d-block ms-4">{formData.phone}</small>
                                )}
                            </div>
                        )}

                        {formData.address && (
                            <div className="mb-3">
                                <Icon icon="mdi:map-marker" className="me-2 text-danger" />
                                <span className="small">{formData.address}</span>
                            </div>
                        )}

                        {(formData.city || formData.state || formData.pincode) && (
                            <div className="mb-3 small text-muted">
                                {formData.city && <span>{formData.city}</span>}
                                {formData.state && <span>, {formData.state}</span>}
                                {formData.pincode && <span> - {formData.pincode}</span>}
                            </div>
                        )}

                        {formData.country && (
                            <div className="mb-3 small text-muted">
                                <Icon icon="mdi:flag" className="me-2" />
                                {formData.country}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <span className={`badge ${formData.type === 'home' ? 'bg-success' : 'bg-info'}`}>
                                <Icon icon={formData.type === 'home' ? 'mdi:home' : 'mdi:office-building'} className="me-1" />
                                {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                            </span>
                            {formData.isDefault && (
                                <span className="badge bg-warning text-dark">
                                    <Icon icon="mdi:star" className="me-1" />
                                    Default
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="card mt-3">
                    <div className="card-header bg-light">
                        <h6 className="mb-0">
                            <Icon icon="mdi:lightbulb" className="me-2 text-warning" />
                            Tips
                        </h6>
                    </div>
                    <div className="card-body">
                        <ul className="small mb-0 ps-3">
                            <li className="mb-2">Provide complete address with landmarks</li>
                            <li className="mb-2">Double check phone number for delivery</li>
                            <li className="mb-2">Set one address as default for quick checkout</li>
                            <li className="mb-0">You can add multiple addresses for different locations</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditAddressLayer;
