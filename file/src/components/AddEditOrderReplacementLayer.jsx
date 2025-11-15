import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditOrderReplacementLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        orderId: '',
        userId: '',
        items: [{ productId: '', quantity: 1 }],
        reason: '',
        status: 'requested'
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    // Status options
    const statusOptions = [
        {
            value: 'requested',
            label: 'Requested',
            color: 'warning',
            icon: 'mdi:clock-outline',
            description: 'Replacement has been requested'
        },
        {
            value: 'approved',
            label: 'Approved',
            color: 'success',
            icon: 'mdi:check-circle',
            description: 'Replacement request approved'
        },
        {
            value: 'shipped',
            label: 'Shipped',
            color: 'info',
            icon: 'mdi:truck-delivery',
            description: 'Replacement item has been shipped'
        },
        {
            value: 'completed',
            label: 'Completed',
            color: 'primary',
            icon: 'mdi:check-all',
            description: 'Replacement completed successfully'
        }
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');

        console.log('=== AddEditOrderReplacement Mount ===');
        console.log('Token exists:', !!token);
        console.log('Edit mode:', isEditMode);

        if (!token) {
            console.error('❌ No token found - redirecting to login');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }

        const timer = setTimeout(() => {
            console.log('🔄 Starting data fetch...');

            const fetchData = async () => {
                try {
                    const ordersSuccess = await fetchOrders();
                    const usersSuccess = await fetchUsers();
                    const productsSuccess = await fetchProducts();
                    console.log('✅ Fetch results', { ordersSuccess, usersSuccess, productsSuccess });

                    if (isEditMode) {
                        await fetchOrderReplacement();
                    }
                } catch (error) {
                    console.error('❌ Error in fetchData:', error);
                }
            };

            fetchData();
        }, 100);

        return () => clearTimeout(timer);
    }, [id]);

    const fetchOrders = async () => {
        console.log('📦 fetchOrders: Starting...');
        try {
            const response = await api.get('/orders');
            console.log('📦 fetchOrders: SUCCESS -', response.data);
            const ordersData = response.data.data || response.data || [];
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            return true;
        } catch (error) {
            console.error('❌ fetchOrders: FAILED -', error);
            if (error.status !== 401) {
                toast.error('Failed to fetch orders. You can still proceed...');
            }
            return false;
        }
    };

    const fetchUsers = async () => {
        console.log('👥 fetchUsers: Starting...');
        try {
            const response = await api.get('/admin/users');
            console.log('👥 fetchUsers: SUCCESS -', response.data);
            const usersData = response.data.users || response.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
            return true;
        } catch (error) {
            console.error('❌ fetchUsers: FAILED -', error);
            if (error.status !== 401) {
                toast.error('Failed to fetch users. You can still proceed...');
            }
            return false;
        }
    };

    const fetchProducts = async () => {
        console.log('🛍️ fetchProducts: Starting...');
        try {
            const response = await api.get('/products');
            console.log('🛍️ fetchProducts: SUCCESS -', response.data);
            const productsData = response.data.products || response.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
            return true;
        } catch (error) {
            console.error('❌ fetchProducts: FAILED -', error);
            if (error.status !== 401) {
                toast.error('Failed to fetch products. You can still proceed...');
            }
            return false;
        }
    };

    const fetchOrderReplacement = async () => {
        try {
            const response = await api.get(`/order-replacements/${id}`);
            const replacementData = response.data;

            setFormData({
                orderId: replacementData.orderId?._id || '',
                userId: replacementData.userId?._id || '',
                items: replacementData.items.map(item => ({
                    productId: item.productId?._id || '',
                    quantity: item.quantity || 1
                })),
                reason: replacementData.reason || '',
                status: replacementData.status || 'requested'
            });
        } catch (error) {
            console.error('Error fetching order replacement:', error);
            toast.error('Failed to fetch order replacement details');
            navigate('/order-replacements');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index][field] = value;
        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productId: '', quantity: 1 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) {
            toast.warning('At least one item is required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.orderId) {
            errors.orderId = 'Order is required';
        }

        if (!formData.userId) {
            errors.userId = 'User is required';
        }

        if (!formData.reason || formData.reason.length < 10) {
            errors.reason = 'Reason must be at least 10 characters';
        }

        formData.items.forEach((item, index) => {
            if (!item.productId) {
                errors[`items[${index}].productId`] = 'Product is required';
            }
            if (!item.quantity || item.quantity < 1) {
                errors[`items[${index}].quantity`] = 'Valid quantity is required';
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix all validation errors');
            return;
        }

        setLoading(true);

        try {
            if (isEditMode) {
                await api.put(`/order-replacements/${id}`, formData);
                toast.success('Order replacement updated successfully');
            } else {
                await api.post('/order-replacements', formData);
                toast.success('Order replacement created successfully');
            }
            navigate('/order-replacements');
        } catch (error) {
            console.error('Error saving order replacement:', error);
            toast.error(error.response?.data?.error || 'Failed to save order replacement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-lg mb-0">{isEditMode ? 'Edit' : 'Add'} Order Replacement</h6>
            </div>

            <div className="card-body p-24">
                <form onSubmit={handleSubmit}>
                    {/* Order and User Selection */}
                    <div className="row mb-20">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Order <span className="text-danger-600">*</span>
                            </label>
                            <select
                                className={`form-control radius-8 ${validationErrors.orderId ? 'is-invalid' : ''}`}
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Select an order</option>
                                {orders.map(order => (
                                    <option key={order._id} value={order._id}>
                                        #{order._id.slice(-8).toUpperCase()} - ${order.totalAmount} ({order.status})
                                    </option>
                                ))}
                            </select>
                            {validationErrors.orderId && (
                                <div className="invalid-feedback">{validationErrors.orderId}</div>
                            )}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                Customer <span className="text-danger-600">*</span>
                            </label>
                            <select
                                className={`form-control radius-8 ${validationErrors.userId ? 'is-invalid' : ''}`}
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Select a customer</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {validationErrors.userId && (
                                <div className="invalid-feedback">{validationErrors.userId}</div>
                            )}
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="mb-20">
                        <div className="d-flex justify-content-between align-items-center mb-12">
                            <label className="form-label fw-semibold text-primary-light text-sm mb-0">
                                Replacement Items <span className="text-danger-600">*</span>
                            </label>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                onClick={addItem}
                                disabled={loading}
                            >
                                <Icon icon="mdi:plus" />
                                Add Item
                            </button>
                        </div>

                        {formData.items.map((item, index) => (
                            <div key={index} className="border rounded-3 p-16 mb-12 bg-neutral-50">
                                <div className="d-flex justify-content-between align-items-center mb-12">
                                    <h6 className="text-md mb-0">Item {index + 1}</h6>
                                    {formData.items.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeItem(index)}
                                            disabled={loading}
                                        >
                                            <Icon icon="mdi:delete" />
                                        </button>
                                    )}
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label text-sm mb-8">
                                            Product <span className="text-danger-600">*</span>
                                        </label>
                                        <select
                                            className={`form-control radius-8 ${validationErrors[`items[${index}].productId`] ? 'is-invalid' : ''}`}
                                            value={item.productId}
                                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="">Select product</option>
                                            {products.map(product => (
                                                <option key={product._id} value={product._id}>
                                                    {product.title} - ${product.price}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors[`items[${index}].productId`] && (
                                            <div className="invalid-feedback">{validationErrors[`items[${index}].productId`]}</div>
                                        )}
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label text-sm mb-8">
                                            Quantity <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control radius-8 ${validationErrors[`items[${index}].quantity`] ? 'is-invalid' : ''}`}
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                            min="1"
                                            disabled={loading}
                                        />
                                        {validationErrors[`items[${index}].quantity`] && (
                                            <div className="invalid-feedback">{validationErrors[`items[${index}].quantity`]}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reason */}
                    <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                            Replacement Reason <span className="text-danger-600">*</span>
                        </label>
                        <textarea
                            className={`form-control radius-8 ${validationErrors.reason ? 'is-invalid' : ''}`}
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="Enter detailed reason for replacement (min 10 characters)..."
                            rows="4"
                            disabled={loading}
                        />
                        <div className="form-text d-flex justify-content-between">
                            <span>Minimum 10 characters</span>
                            <span>{formData.reason.length}/1000</span>
                        </div>
                        {validationErrors.reason && (
                            <div className="invalid-feedback">{validationErrors.reason}</div>
                        )}
                    </div>

                    {/* Status Selection */}
                    <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-12">
                            Replacement Status <span className="text-danger-600">*</span>
                        </label>
                        <div className="row g-3">
                            {statusOptions.map((option) => (
                                <div key={option.value} className="col-md-3">
                                    <div
                                        className={`card cursor-pointer ${formData.status === option.value ? `border-${option.color}-600 bg-${option.color}-50` : 'border-neutral-200'}`}
                                        onClick={() => !loading && setFormData(prev => ({ ...prev, status: option.value }))}
                                        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                                    >
                                        <div className="card-body p-16 text-center">
                                            <Icon
                                                icon={option.icon}
                                                className={`text-${option.color}-600`}
                                                style={{ fontSize: '32px' }}
                                            />
                                            <h6 className={`mt-8 mb-4 text-${option.color}-600`}>
                                                {option.label}
                                            </h6>
                                            <p className="text-xs text-secondary-light mb-0">
                                                {option.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex align-items-center justify-content-center gap-3 mt-24">
                        <button
                            type="button"
                            onClick={() => navigate('/order-replacements')}
                            className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-40 py-11 radius-8"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary border border-primary-600 text-md px-24 py-12 radius-8"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Saving...
                                </>
                            ) : (
                                <>{isEditMode ? 'Update' : 'Create'} Replacement</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditOrderReplacementLayer;
