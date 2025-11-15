import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

const AddEditReturnLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        orderId: "",
        userId: "",
        productId: "",
        reason: "",
        status: "requested",
        resolution: "refund",
        adminNote: "",
        refundAmount: 0,
    });

    const [errors, setErrors] = useState({});

    // Fetch dropdown data
    useEffect(() => {
        fetchOrders();
        fetchUsers();
        fetchProducts();

        if (isEditMode) {
            fetchReturnData();
        }
    }, [id]);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/order-history`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const ordersData = response.data.data || response.data || [];
            setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/users`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const usersData = response.data.users || response.data || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/products`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const productsData = response.data || [];
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchReturnData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/returns/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const returnData = response.data.data;
            setFormData({
                orderId: returnData.orderId?._id || "",
                userId: returnData.userId?._id || "",
                productId: returnData.productId?._id || "",
                reason: returnData.reason || "",
                status: returnData.status || "requested",
                resolution: returnData.resolution || "refund",
                adminNote: returnData.adminNote || "",
                refundAmount: returnData.refundAmount || 0,
            });
        } catch (error) {
            console.error("Error fetching return data:", error);
            toast.error("Failed to fetch return data");
            navigate("/returns");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.orderId) {
            newErrors.orderId = "Order is required";
        }

        if (!formData.userId) {
            newErrors.userId = "User is required";
        }

        if (!formData.productId) {
            newErrors.productId = "Product is required";
        }

        if (!formData.reason.trim()) {
            newErrors.reason = "Reason is required";
        } else if (formData.reason.length > 1000) {
            newErrors.reason = "Reason cannot exceed 1000 characters";
        }

        if (!formData.resolution) {
            newErrors.resolution = "Resolution type is required";
        }

        if (formData.refundAmount < 0) {
            newErrors.refundAmount = "Refund amount cannot be negative";
        }

        if (formData.adminNote && formData.adminNote.length > 1000) {
            newErrors.adminNote = "Admin note cannot exceed 1000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix all errors before submitting");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = isEditMode
                ? `${import.meta.env.VITE_BACKEND_URL}/api/returns/${id}`
                : `${import.meta.env.VITE_BACKEND_URL}/api/returns`;

            const method = isEditMode ? "put" : "post";

            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success(
                `Return ${isEditMode ? "updated" : "created"} successfully`
            );
            navigate("/returns");
        } catch (error) {
            console.error("Error saving return:", error);
            toast.error(
                error.response?.data?.message || "Failed to save return"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Icon
                    icon="mdi:loading"
                    className="text-6xl text-blue-500 animate-spin"
                />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate("/returns")}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl mr-2" />
                    Back to Returns
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditMode ? "Edit Return" : "Add New Return"}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditMode
                        ? "Update return request information"
                        : "Create a new return request"}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Order, User, Product Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Order */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.orderId ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select Order</option>
                                {orders.map((order) => (
                                    <option key={order._id} value={order._id}>
                                        {order._id?.slice(-8)} - ${order.totalAmount || 0}
                                    </option>
                                ))}
                            </select>
                            {errors.orderId && (
                                <p className="text-red-500 text-sm mt-1">{errors.orderId}</p>
                            )}
                        </div>

                        {/* User */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="userId"
                                value={formData.userId}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.userId ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select Customer</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                            {errors.userId && (
                                <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
                            )}
                        </div>

                        {/* Product */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.productId ? "border-red-500" : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        {product.title} - ${product.price}
                                    </option>
                                ))}
                            </select>
                            {errors.productId && (
                                <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Return Details */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Return Details
                    </h2>
                    <div className="space-y-6">
                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Return <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe the reason for this return..."
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.reason ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.reason ? (
                                    <p className="text-red-500 text-sm">{errors.reason}</p>
                                ) : (
                                    <span className="text-gray-500 text-sm">
                                        {formData.reason.length}/1000 characters
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Resolution and Refund Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Resolution Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resolution Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() =>
                                            setFormData((prev) => ({ ...prev, resolution: "refund" }))
                                        }
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.resolution === "refund"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    >
                                        <Icon
                                            icon="mdi:cash-refund"
                                            className={`text-4xl mx-auto mb-2 ${formData.resolution === "refund"
                                                ? "text-blue-500"
                                                : "text-gray-400"
                                                }`}
                                        />
                                        <p
                                            className={`text-center font-semibold ${formData.resolution === "refund"
                                                ? "text-blue-700"
                                                : "text-gray-700"
                                                }`}
                                        >
                                            Refund
                                        </p>
                                    </div>
                                    <div
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                resolution: "replacement",
                                            }))
                                        }
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.resolution === "replacement"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    >
                                        <Icon
                                            icon="mdi:package-variant"
                                            className={`text-4xl mx-auto mb-2 ${formData.resolution === "replacement"
                                                ? "text-blue-500"
                                                : "text-gray-400"
                                                }`}
                                        />
                                        <p
                                            className={`text-center font-semibold ${formData.resolution === "replacement"
                                                ? "text-blue-700"
                                                : "text-gray-700"
                                                }`}
                                        >
                                            Replacement
                                        </p>
                                    </div>
                                </div>
                                {errors.resolution && (
                                    <p className="text-red-500 text-sm mt-1">{errors.resolution}</p>
                                )}
                            </div>

                            {/* Refund Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Amount
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <input
                                        type="number"
                                        name="refundAmount"
                                        value={formData.refundAmount}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.refundAmount ? "border-red-500" : "border-gray-300"
                                            }`}
                                    />
                                </div>
                                {errors.refundAmount && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.refundAmount}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status and Admin Note */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Status & Admin Information
                    </h2>
                    <div className="space-y-6">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Status
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    {
                                        value: "requested",
                                        label: "Requested",
                                        icon: "mdi:clock-outline",
                                        color: "blue",
                                    },
                                    {
                                        value: "approved",
                                        label: "Approved",
                                        icon: "mdi:check-circle",
                                        color: "green",
                                    },
                                    {
                                        value: "rejected",
                                        label: "Rejected",
                                        icon: "mdi:close-circle",
                                        color: "red",
                                    },
                                    {
                                        value: "refunded",
                                        label: "Refunded",
                                        icon: "mdi:cash-check",
                                        color: "purple",
                                    },
                                ].map((status) => (
                                    <div
                                        key={status.value}
                                        onClick={() =>
                                            setFormData((prev) => ({ ...prev, status: status.value }))
                                        }
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.status === status.value
                                            ? `border-${status.color}-500 bg-${status.color}-50`
                                            : "border-gray-300 hover:border-gray-400"
                                            }`}
                                    >
                                        <Icon
                                            icon={status.icon}
                                            className={`text-3xl mx-auto mb-2 ${formData.status === status.value
                                                ? `text-${status.color}-500`
                                                : "text-gray-400"
                                                }`}
                                        />
                                        <p
                                            className={`text-center text-sm font-semibold ${formData.status === status.value
                                                ? `text-${status.color}-700`
                                                : "text-gray-700"
                                                }`}
                                        >
                                            {status.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin Note */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Note
                            </label>
                            <textarea
                                name="adminNote"
                                value={formData.adminNote}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Add internal notes or comments about this return..."
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.adminNote ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {errors.adminNote ? (
                                    <p className="text-red-500 text-sm">{errors.adminNote}</p>
                                ) : (
                                    <span className="text-gray-500 text-sm">
                                        {formData.adminNote.length}/1000 characters
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/returns")}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Icon icon="mdi:loading" className="animate-spin" />
                                {isEditMode ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:content-save" />
                                {isEditMode ? "Update Return" : "Create Return"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditReturnLayer;
