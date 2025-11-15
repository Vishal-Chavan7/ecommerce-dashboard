import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

const ViewReturnLayer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [returnData, setReturnData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReturnData();
    }, [id]);

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

            setReturnData(response.data.data);
        } catch (error) {
            console.error("Error fetching return data:", error);
            toast.error("Failed to fetch return data");
            navigate("/returns");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this return?")) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/returns/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success("Return deleted successfully");
            navigate("/returns");
        } catch (error) {
            console.error("Error deleting return:", error);
            toast.error("Failed to delete return");
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            requested: { color: "bg-blue-100 text-blue-800", label: "Requested" },
            approved: { color: "bg-green-100 text-green-800", label: "Approved" },
            rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
            refunded: { color: "bg-purple-100 text-purple-800", label: "Refunded" },
        };

        const config = statusConfig[status] || {
            color: "bg-gray-100 text-gray-800",
            label: status,
        };

        return (
            <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${config.color}`}
            >
                {config.label}
            </span>
        );
    };

    const getResolutionBadge = (resolution) => {
        const color =
            resolution === "refund"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-indigo-100 text-indigo-800";
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${color}`}>
                {resolution === "refund" ? "Refund" : "Replacement"}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Icon
                    icon="mdi:loading"
                    className="text-6xl text-blue-500 animate-spin"
                />
            </div>
        );
    }

    if (!returnData) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <Icon
                        icon="mdi:alert-circle"
                        className="text-6xl text-red-500 mx-auto mb-4"
                    />
                    <p className="text-xl text-gray-600">Return not found</p>
                    <button
                        onClick={() => navigate("/returns")}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Returns
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate("/returns")}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <Icon icon="mdi:arrow-left" className="text-xl mr-2" />
                    Back to Returns
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Return Details</h1>
                        <p className="text-gray-600 mt-1">
                            Return ID: {returnData._id?.slice(-8)}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(`/edit-return/${id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Icon icon="mdi:pencil" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Icon icon="mdi:delete" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status and Resolution */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Status Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                                {getStatusBadge(returnData.status)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Resolution Type</p>
                                {getResolutionBadge(returnData.resolution)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Refund Amount</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${returnData.refundAmount?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Product Information
                        </h2>
                        <div className="flex items-start gap-6">
                            {returnData.productId?.images?.[0] && (
                                <img
                                    src={returnData.productId.images[0]}
                                    alt={returnData.productId.title}
                                    className="w-32 h-32 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {returnData.productId?.title || "Unknown Product"}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Price</p>
                                        <p className="font-semibold text-gray-800">
                                            ${returnData.productId?.price?.toFixed(2) || "0.00"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Category</p>
                                        <p className="font-semibold text-gray-800">
                                            {returnData.productId?.category || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Return Reason */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Return Reason
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-800 whitespace-pre-wrap">
                                {returnData.reason || "No reason provided"}
                            </p>
                        </div>
                    </div>

                    {/* Admin Note */}
                    {returnData.adminNote && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Icon icon="mdi:shield-account" className="text-blue-500" />
                                Admin Note
                            </h2>
                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                                <p className="text-gray-800 whitespace-pre-wrap">
                                    {returnData.adminNote}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Timeline
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 rounded-full p-2">
                                    <Icon
                                        icon="mdi:calendar-clock"
                                        className="text-blue-600 text-xl"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Request Date</p>
                                    <p className="text-gray-600">
                                        {new Date(returnData.requestDate).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {returnData.processedAt && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 rounded-full p-2">
                                        <Icon
                                            icon="mdi:check-circle"
                                            className="text-green-600 text-xl"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Processed Date</p>
                                        <p className="text-gray-600">
                                            {new Date(returnData.processedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 rounded-full p-2">
                                    <Icon
                                        icon="mdi:update"
                                        className="text-gray-600 text-xl"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Last Updated</p>
                                    <p className="text-gray-600">
                                        {new Date(returnData.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Icon icon="mdi:account" className="text-blue-500" />
                            Customer Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-semibold text-gray-800">
                                    {returnData.userId?.name || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold text-gray-800">
                                    {returnData.userId?.email || "N/A"}
                                </p>
                            </div>
                            {returnData.userId?.phone && (
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold text-gray-800">
                                        {returnData.userId.phone}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Order */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Icon icon="mdi:shopping" className="text-purple-500" />
                            Related Order
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Order ID</p>
                                <p className="font-mono font-semibold text-gray-800">
                                    {returnData.orderId?._id?.slice(-8) || "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Total</p>
                                <p className="font-semibold text-gray-800">
                                    ${returnData.orderId?.totalAmount?.toFixed(2) || "0.00"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Status</p>
                                <span
                                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${returnData.orderId?.status === "delivered"
                                        ? "bg-green-100 text-green-800"
                                        : returnData.orderId?.status === "cancelled"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                >
                                    {returnData.orderId?.status || "N/A"}
                                </span>
                            </div>
                            {returnData.orderId?.createdAt && (
                                <div>
                                    <p className="text-sm text-gray-600">Order Date</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(returnData.orderId.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => navigate(`/view-order/${returnData.orderId?._id}`)}
                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Icon icon="mdi:eye" />
                            View Order
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/edit-return/${id}`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Icon icon="mdi:pencil" />
                                Edit Return
                            </button>
                            <button
                                onClick={() =>
                                    navigate(`/view-user/${returnData.userId?._id}`)
                                }
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                <Icon icon="mdi:account" />
                                View Customer
                            </button>
                            <button
                                onClick={() =>
                                    navigate(`/view-product/${returnData.productId?._id}`)
                                }
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <Icon icon="mdi:package-variant" />
                                View Product
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Icon icon="mdi:delete" />
                                Delete Return
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewReturnLayer;
