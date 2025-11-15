import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const AddEditOrderReturnLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        orderId: '',
        userId: '',
        items: [{ productId: '', quantity: 1, reason: '' }],
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
            description: 'Customer has requested a return'
        },
        {
            value: 'approved',
            label: 'Approved',
            color: 'success',
            icon: 'mdi:check-circle',
            description: 'Return request has been approved'
        },
        {
            value: 'rejected',
            label: 'Rejected',
            color: 'danger',
            icon: 'mdi:close-circle',
            description: 'Return request has been rejected'
        },
        {
            value: 'refunded',
            label: 'Refunded',
            color: 'info',
            icon: 'mdi:cash-refund',
            description: 'Refund has been processed'
        }
    ];

    useEffect(() => {
        const token = localStorage.getItem('token');

        console.log('=== AddEditOrderReturn Mount ===');
        console.log('Token exists:', !!token);
        console.log('Edit mode:', isEditMode);

        if (!token) {
            console.error('❌ No token found - redirecting to login');
            toast.error('Please log in to access this page');
            navigate('/sign-in');
            return;
        }

        // Add delay to ensure component is mounted
        const timer = setTimeout(() => {
            console.log('🔄 Starting data fetch...');

            const fetchData = async () => {
                try {
                    const ordersSuccess = await fetchOrders();
                    const usersSuccess = await fetchUsers();
                    const productsSuccess = await fetchProducts();
                    console.log('✅ Fetch results', { ordersSuccess, usersSuccess, productsSuccess });

                    if (isEditMode) {
                        await fetchOrderReturn();
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
            // Handle both formats: { data: [...] } or direct array
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
            // Handle both formats: { users: [...] } or direct array
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
            // Handle both formats: { products: [...] } or direct array
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

    const fetchOrderReturn = async () => {
        try {
            const response = await api.get(`/order-returns/${id}`);
            const returnData = response.data;

            setFormData({
                orderId: returnData.orderId?._id || '',
                userId: returnData.userId?._id || '',
                items: returnData.items.map(item => ({
                    productId: item.productId?._id || '',
                    quantity: item.quantity || 1,
                    reason: item.reason || ''
                })),
                status: returnData.status || 'requested'
            });
        } catch (error) {
            console.error('Error fetching order return:', error);
            toast.error('Failed to fetch order return details');
            navigate('/order-returns');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear validation error for this field
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
            items: [...prev.items, { productId: '', quantity: 1, reason: '' }]
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

        formData.items.forEach((item, index) => {
            if (!item.productId) {
                errors[`items[${index}].productId`] = 'Product is required';
            }
            if (!item.quantity || item.quantity < 1) {
                errors[`items[${index}].quantity`] = 'Valid quantity is required';
            }
            if (!item.reason || item.reason.length < 10) {
                errors[`items[${index}].reason`] = 'Reason must be at least 10 characters';
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
                await api.put(`/order-returns/${id}`, formData);
                toast.success('Order return updated successfully');
            } else {
                await api.post('/order-returns', formData);
                toast.success('Order return created successfully');
            }
            navigate('/order-returns');
        } catch (error) {
            console.error('Error saving order return:', error);
            toast.error(error.response?.data?.error || 'Failed to save order return');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-lg mb-0">{isEditMode ? 'Edit' : 'Add'} Order Return</h6>
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
                                Return Items <span className="text-danger-600">*</span>
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
                                    <div className="col-md-4">
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

                                    <div className="col-md-2">
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

                                    <div className="col-md-6">
                                        <label className="form-label text-sm mb-8">
                                            Return Reason <span className="text-danger-600">*</span>
                                        </label>
                                        <textarea
                                            className={`form-control radius-8 ${validationErrors[`items[${index}].reason`] ? 'is-invalid' : ''}`}
                                            value={item.reason}
                                            onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                                            placeholder="Enter reason for return (min 10 characters)..."
                                            rows="2"
                                            disabled={loading}
                                        />
                                        <div className="form-text d-flex justify-content-between">
                                            <span>Minimum 10 characters</span>
                                            <span>{item.reason.length}/500</span>
                                        </div>
                                        {validationErrors[`items[${index}].reason`] && (
                                            <div className="invalid-feedback">{validationErrors[`items[${index}].reason`]}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Status Selection */}
                    <div className="mb-20">
                        <label className="form-label fw-semibold text-primary-light text-sm mb-12">
                            Return Status <span className="text-danger-600">*</span>
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
                            onClick={() => navigate('/order-returns')}
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
                                <>{isEditMode ? 'Update' : 'Create'} Return</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditOrderReturnLayer;
