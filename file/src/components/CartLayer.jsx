import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const CartLayer = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Session management
    const getSessionId = () => {
        let sessionId = localStorage.getItem('cart_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cart_session_id', sessionId);
        }
        return sessionId;
    };

    const getUserId = () => {
        // Get from localStorage or authentication context
        return localStorage.getItem('user_id') || null;
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const params = {
                sessionId: getSessionId(),
                ...(getUserId() && { userId: getUserId() })
            };

            const response = await api.get('/cart', { params });
            setCart(response.data.data);

            if (response.data.data.couponCode) {
                setCouponCode(response.data.data.couponCode);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            // Don't show error toast for empty cart
            if (error.response?.status !== 404) {
                toast.error('Failed to fetch cart');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, variantId, newQuantity) => {
        if (newQuantity < 1) return;

        const itemKey = `${productId}_${variantId || 'no-variant'}`;
        setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));

        try {
            const response = await api.put('/cart/update-quantity', {
                userId: getUserId(),
                sessionId: getSessionId(),
                productId,
                variantId: variantId || null,
                quantity: newQuantity
            });

            setCart(response.data.data);
            toast.success('Quantity updated');
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error(error.response?.data?.message || 'Failed to update quantity');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
        }
    };

    const removeItem = async (productId, variantId) => {
        const itemKey = `${productId}_${variantId || 'no-variant'}`;
        setUpdatingItems(prev => ({ ...prev, [itemKey]: true }));

        try {
            const response = await api.delete('/cart/item', {
                data: {
                    userId: getUserId(),
                    sessionId: getSessionId(),
                    productId,
                    variantId: variantId || null
                }
            });

            setCart(response.data.data);
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemKey]: false }));
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) {
            return;
        }

        try {
            setLoading(true);
            await api.post('/cart/clear', {
                userId: getUserId(),
                sessionId: getSessionId()
            });

            setCart({ items: [], couponCode: null, discount: 0, cartTotal: 0 });
            setCouponCode('');
            toast.success('Cart cleared successfully');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.warning('Please enter a coupon code');
            return;
        }

        try {
            setApplyingCoupon(true);
            const response = await api.post('/cart/apply-coupon', {
                userId: getUserId(),
                sessionId: getSessionId(),
                couponCode: couponCode.trim()
            });

            setCart(response.data.data);
            toast.success('Coupon applied successfully');
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error(error.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = async () => {
        try {
            const response = await api.post('/cart/remove-coupon', {
                userId: getUserId(),
                sessionId: getSessionId()
            });

            setCart(response.data.data);
            setCouponCode('');
            toast.success('Coupon removed');
        } catch (error) {
            console.error('Error removing coupon:', error);
            toast.error('Failed to remove coupon');
        }
    };

    const getProductImage = (item) => {
        if (item.variantId?.images && item.variantId.images.length > 0) {
            return item.variantId.images[0];
        }
        if (item.productId?.images && item.productId.images.length > 0) {
            return item.productId.images[0];
        }
        return '/placeholder-product.png';
    };

    const getProductName = (item) => {
        return item.productId?.title || item.productId?.name || 'Unknown Product';
    };

    const getVariantName = (item) => {
        return item.variantId?.variantName || null;
    };

    const calculateSubtotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
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

    const isEmpty = !cart || !cart.items || cart.items.length === 0;

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Cart Items Section */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <Icon icon="mdi:cart" className="me-2" />
                                Shopping Cart
                                {!isEmpty && (
                                    <span className="badge bg-primary ms-2">{cart.items.length}</span>
                                )}
                            </h5>
                            {!isEmpty && (
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={clearCart}
                                >
                                    <Icon icon="mdi:delete-sweep" className="me-1" />
                                    Clear Cart
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {isEmpty ? (
                                <div className="text-center py-5">
                                    <Icon icon="mdi:cart-off" width="80" className="text-muted mb-3" />
                                    <h5 className="text-muted mb-3">Your cart is empty</h5>
                                    <p className="text-muted mb-4">Add some products to get started!</p>
                                    <Link to="/products" className="btn btn-primary">
                                        <Icon icon="mdi:shopping" className="me-2" />
                                        Continue Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th width="150">Quantity</th>
                                                <th>Subtotal</th>
                                                <th width="80">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.items.map((item, index) => {
                                                const itemKey = `${item.productId?._id}_${item.variantId?._id || 'no-variant'}`;
                                                const isUpdating = updatingItems[itemKey];

                                                return (
                                                    <tr key={index} style={{ opacity: isUpdating ? 0.6 : 1 }}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={getProductImage(item)}
                                                                    alt={getProductName(item)}
                                                                    className="rounded"
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '60px',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                    onError={(e) => {
                                                                        e.target.src = '/placeholder-product.png';
                                                                    }}
                                                                />
                                                                <div className="ms-3">
                                                                    <h6 className="mb-0">{getProductName(item)}</h6>
                                                                    {getVariantName(item) && (
                                                                        <small className="text-muted">
                                                                            Variant: {getVariantName(item)}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <span className="fw-bold text-success">₹{item.finalPrice}</span>
                                                                {item.finalPrice < item.price && (
                                                                    <div className="small text-muted text-decoration-line-through">
                                                                        ₹{item.price}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="input-group input-group-sm">
                                                                <button
                                                                    className="btn btn-outline-secondary"
                                                                    onClick={() => updateQuantity(
                                                                        item.productId._id,
                                                                        item.variantId?._id,
                                                                        item.quantity - 1
                                                                    )}
                                                                    disabled={isUpdating || item.quantity <= 1}
                                                                >
                                                                    <Icon icon="mdi:minus" />
                                                                </button>
                                                                <input
                                                                    type="text"
                                                                    className="form-control text-center"
                                                                    value={item.quantity}
                                                                    readOnly
                                                                    style={{ maxWidth: '60px' }}
                                                                />
                                                                <button
                                                                    className="btn btn-outline-secondary"
                                                                    onClick={() => updateQuantity(
                                                                        item.productId._id,
                                                                        item.variantId?._id,
                                                                        item.quantity + 1
                                                                    )}
                                                                    disabled={isUpdating}
                                                                >
                                                                    <Icon icon="mdi:plus" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="fw-bold">
                                                                ₹{(item.finalPrice * item.quantity).toFixed(2)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => removeItem(
                                                                    item.productId._id,
                                                                    item.variantId?._id
                                                                )}
                                                                disabled={isUpdating}
                                                                title="Remove"
                                                            >
                                                                <Icon icon="mdi:delete" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Continue Shopping Button */}
                    {!isEmpty && (
                        <div className="mt-3">
                            <Link to="/products" className="btn btn-outline-primary">
                                <Icon icon="mdi:arrow-left" className="me-2" />
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {/* Order Summary Section */}
                {!isEmpty && (
                    <div className="col-lg-4">
                        {/* Coupon Card */}
                        <div className="card border-0 shadow-sm mb-3">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:ticket-percent" className="me-2" />
                                    Apply Coupon
                                </h6>
                            </div>
                            <div className="card-body">
                                {cart.couponCode ? (
                                    <div className="alert alert-success d-flex justify-content-between align-items-center mb-0">
                                        <div>
                                            <Icon icon="mdi:check-circle" className="me-2" />
                                            <strong>{cart.couponCode}</strong> applied
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={removeCoupon}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            onClick={applyCoupon}
                                            disabled={applyingCoupon || !couponCode.trim()}
                                        >
                                            {applyingCoupon ? 'Applying...' : 'Apply'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-white">
                                <h6 className="mb-0">
                                    <Icon icon="mdi:receipt-text" className="me-2" />
                                    Order Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Subtotal:</span>
                                    <span className="fw-bold">₹{calculateSubtotal().toFixed(2)}</span>
                                </div>

                                {cart.discount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Discount:</span>
                                        <span className="fw-bold">-₹{cart.discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <hr />

                                <div className="d-flex justify-content-between mb-3">
                                    <span className="fw-bold fs-5">Total:</span>
                                    <span className="fw-bold fs-5 text-primary">
                                        ₹{cart.cartTotal.toFixed(2)}
                                    </span>
                                </div>

                                <button className="btn btn-primary w-100 mb-2">
                                    <Icon icon="mdi:credit-card" className="me-2" />
                                    Proceed to Checkout
                                </button>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        <Icon icon="mdi:shield-check" className="me-1" />
                                        Secure Checkout
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body">
                                <h6 className="mb-3">
                                    <Icon icon="mdi:information" className="me-2 text-primary" />
                                    Need Help?
                                </h6>
                                <ul className="small mb-0 ps-3">
                                    <li className="mb-2">Free shipping on orders above ₹999</li>
                                    <li className="mb-2">Easy returns within 7 days</li>
                                    <li>24/7 customer support available</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartLayer;
