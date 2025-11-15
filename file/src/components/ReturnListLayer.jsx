import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";
import { toast } from "react-toastify";

const ReturnListLayer = () => {
    const navigate = useNavigate();
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [resolutionFilter, setResolutionFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Statistics state
    const [statistics, setStatistics] = useState({
        total: 0,
        requested: 0,
        approved: 0,
        rejected: 0,
        refunded: 0,
        totalRefundAmount: 0,
    });

    // Fetch returns
    useEffect(() => {
        fetchReturns();
        fetchStatistics();
    }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/returns`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const returnsData = response.data.data || response.data || [];
            setReturns(Array.isArray(returnsData) ? returnsData : []);
            setFilteredReturns(Array.isArray(returnsData) ? returnsData : []);
        } catch (error) {
            console.error("Error fetching returns:", error);
            if (error.response?.status !== 401) {
                toast.error("Failed to fetch returns");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/returns/statistics`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.success) {
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
        }
    };

    // Filter returns
    useEffect(() => {
        let filtered = [...returns];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((returnItem) => {
                const orderId = returnItem.orderId?._id?.toLowerCase() || "";
                const userName = returnItem.userId?.name?.toLowerCase() || "";
                const userEmail = returnItem.userId?.email?.toLowerCase() || "";
                const productTitle = returnItem.productId?.title?.toLowerCase() || "";
                const reason = returnItem.reason?.toLowerCase() || "";
                const search = searchTerm.toLowerCase();

                return (
                    orderId.includes(search) ||
                    userName.includes(search) ||
                    userEmail.includes(search) ||
                    productTitle.includes(search) ||
                    reason.includes(search)
                );
            });
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (returnItem) => returnItem.status === statusFilter
            );
        }

        // Resolution filter
        if (resolutionFilter !== "all") {
            filtered = filtered.filter(
                (returnItem) => returnItem.resolution === resolutionFilter
            );
        }

        setFilteredReturns(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, resolutionFilter, returns]);

    // Delete return
    const handleDelete = async (id) => {
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
            fetchReturns();
            fetchStatistics();
        } catch (error) {
            console.error("Error deleting return:", error);
            toast.error("Failed to delete return");
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReturns = filteredReturns.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);

    // Status badge
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
                className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
            >
                {config.label}
            </span>
        );
    };

    // Resolution badge
    const getResolutionBadge = (resolution) => {
        const color =
            resolution === "refund"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-indigo-100 text-indigo-800";
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
                {resolution === "refund" ? "Refund" : "Replacement"}
            </span>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Returns & Refunds Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage customer return requests and refunds
                    </p>
                </div>
                <button
                    onClick={() => navigate("/add-return")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Icon icon="mdi:plus" className="text-xl" />
                    Add Return
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Returns</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {statistics.total}
                            </p>
                        </div>
                        <Icon
                            icon="mdi:package-variant-closed-check"
                            className="text-4xl text-blue-500"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Requested</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {statistics.requested}
                            </p>
                        </div>
                        <Icon icon="mdi:clock-outline" className="text-4xl text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Approved</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {statistics.approved}
                            </p>
                        </div>
                        <Icon icon="mdi:check-circle" className="text-4xl text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Rejected</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {statistics.rejected}
                            </p>
                        </div>
                        <Icon icon="mdi:close-circle" className="text-4xl text-red-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Refunded</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {statistics.refunded}
                            </p>
                        </div>
                        <Icon icon="mdi:cash-refund" className="text-4xl text-purple-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Refunded</p>
                            <p className="text-2xl font-bold text-gray-800">
                                ${statistics.totalRefundAmount.toFixed(2)}
                            </p>
                        </div>
                        <Icon icon="mdi:currency-usd" className="text-4xl text-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <div className="relative">
                            <Icon
                                icon="mdi:magnify"
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
                            />
                            <input
                                type="text"
                                placeholder="Search by order, user, product, reason..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="requested">Requested</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>

                    {/* Resolution Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolution
                        </label>
                        <select
                            value={resolutionFilter}
                            onChange={(e) => setResolutionFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Resolutions</option>
                            <option value="refund">Refund</option>
                            <option value="replacement">Replacement</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Icon
                            icon="mdi:loading"
                            className="text-4xl text-blue-500 animate-spin"
                        />
                    </div>
                ) : currentReturns.length === 0 ? (
                    <div className="text-center py-12">
                        <Icon
                            icon="mdi:package-variant-closed-remove"
                            className="text-6xl text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-gray-500 text-lg">No returns found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Resolution
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Refund Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Request Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentReturns.map((returnItem) => (
                                        <tr key={returnItem._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-mono text-gray-900">
                                                    {returnItem.orderId?._id?.slice(-8) || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {returnItem.userId?.name || "Unknown"}
                                                    </div>
                                                    <div className="text-gray-500">
                                                        {returnItem.userId?.email || ""}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {returnItem.productId?.images?.[0] && (
                                                        <img
                                                            src={returnItem.productId.images[0]}
                                                            alt={returnItem.productId.title}
                                                            className="w-10 h-10 rounded object-cover mr-3"
                                                        />
                                                    )}
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {returnItem.productId?.title || "Unknown Product"}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            ${returnItem.productId?.price || 0}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {returnItem.reason}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getResolutionBadge(returnItem.resolution)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(returnItem.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ${returnItem.refundAmount?.toFixed(2) || "0.00"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(returnItem.requestDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/view-return/${returnItem._id}`)
                                                        }
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View"
                                                    >
                                                        <Icon icon="mdi:eye" className="text-xl" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/edit-return/${returnItem._id}`)
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Edit"
                                                    >
                                                        <Icon icon="mdi:pencil" className="text-xl" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(returnItem._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <Icon icon="mdi:delete" className="text-xl" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{" "}
                                            <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                                            to{" "}
                                            <span className="font-medium">
                                                {Math.min(indexOfLastItem, filteredReturns.length)}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium">{filteredReturns.length}</span>{" "}
                                            results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                                                }
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <Icon icon="mdi:chevron-left" className="text-xl" />
                                            </button>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentPage(index + 1)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === index + 1
                                                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                                }
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <Icon icon="mdi:chevron-right" className="text-xl" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReturnListLayer;
