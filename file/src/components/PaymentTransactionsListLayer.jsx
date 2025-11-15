import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import axios from 'axios';

const PaymentTransactionsListLayer = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    useEffect(() => {
        fetchTransactions();
        fetchStats();
    }, [pagination.page, statusFilter, paymentMethodFilter, searchTerm, startDate, endDate]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
            });

            if (statusFilter) params.append('status', statusFilter);
            if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);
            if (searchTerm) params.append('search', searchTerm);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            console.log('🔍 Fetching transactions with params:', params.toString());

            const response = await axios.get(
                `http://localhost:5000/api/admin/payment-transactions?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log('✅ Transactions fetched:', response.data);
            setTransactions(response.data.transactions || []);
            setPagination(response.data.pagination || pagination);
        } catch (error) {
            console.error('❌ Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();

            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await axios.get(
                `http://localhost:5000/api/admin/payment-transactions/stats?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setStats(response.data);
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
        }
    };

    const handleRefund = async (transactionId) => {
        if (!window.confirm('Are you sure you want to initiate a refund for this transaction?')) {
            return;
        }

        const refundReason = window.prompt('Enter refund reason (optional):');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/admin/payment-transactions/${transactionId}/refund`,
                { refundReason },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log('✅ Refund initiated:', response.data);
            alert('Refund initiated successfully');
            fetchTransactions();
            fetchStats();
        } catch (error) {
            console.error('❌ Error initiating refund:', error);
            alert(error.response?.data?.message || 'Failed to initiate refund');
        }
    };

    const handleViewDetails = (transactionId) => {
        navigate(`/view-payment-transaction/${transactionId}`);
    };

    // Helper functions
    const getStatusColor = (status) => {
        const colors = {
            initiated: '#6b7280',
            pending: '#f59e0b',
            success: '#10b981',
            failed: '#ef4444',
            refund: '#8b5cf6',
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            initiated: 'mdi:progress-clock',
            pending: 'mdi:timer-sand',
            success: 'mdi:check-circle',
            failed: 'mdi:close-circle',
            refund: 'mdi:cash-refund',
        };
        return icons[status] || 'mdi:help-circle';
    };

    const getPaymentMethodIcon = (method) => {
        const icons = {
            razorpay: 'simple-icons:razorpay',
            stripe: 'simple-icons:stripe',
            paypal: 'simple-icons:paypal',
            paytm: 'simple-icons:paytm',
        };
        return icons[method] || 'mdi:credit-card';
    };

    const getPaymentMethodColor = (method) => {
        const colors = {
            razorpay: '#0c2f8c',
            stripe: '#635bff',
            paypal: '#00457c',
            paytm: '#00baf2',
        };
        return colors[method] || '#6b7280';
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate stats from response
    const getStatValue = (statType) => {
        if (!stats || !stats.statusStats) return 0;
        const stat = stats.statusStats.find((s) => s._id === statType);
        return stat ? stat.count : 0;
    };

    const getTotalAmount = (statType) => {
        if (!stats || !stats.statusStats) return 0;
        const stat = stats.statusStats.find((s) => s._id === statType);
        return stat ? stat.totalAmount : 0;
    };

    // Filter transactions locally for search
    const filteredTransactions = transactions;

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* Header Section - Enhanced */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{
                                backgroundColor: '#3b82f6',
                                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            <Icon icon="mdi:credit-card-sync" style={{ fontSize: '32px', color: '#ffffff' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Transactions</h1>
                            <p className="text-gray-600 mt-2 flex items-center gap-2" style={{ fontSize: '16px' }}>
                                <Icon icon="mdi:information-outline" style={{ fontSize: '18px' }} />
                                Monitor and manage all payment gateway transactions
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/add-payment-transaction')}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                        >
                            <Icon icon="mdi:plus-circle" style={{ fontSize: '20px' }} />
                            <span className="font-semibold text-sm">Add Transaction</span>
                        </button>
                        <button
                            onClick={() => fetchTransactions()}
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                        >
                            <Icon icon="mdi:refresh" style={{ fontSize: '20px' }} />
                            <span className="font-semibold text-sm">Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Enhanced */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: '#6366f120' }}
                                >
                                    <Icon icon="mdi:chart-line" style={{ fontSize: '24px', color: '#6366f1' }} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm font-semibold mb-1">Total Transactions</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalTransactions || 0}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs">
                                <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-semibold">
                                    ✓ {stats.successRate || 0}% Success
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: '#10b98120' }}
                                >
                                    <Icon icon="mdi:check-circle" style={{ fontSize: '24px', color: '#10b981' }} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm font-semibold mb-1">Successful</p>
                            <p className="text-3xl font-bold text-green-600">{getStatValue('success')}</p>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                {formatCurrency(getTotalAmount('success'), 'INR')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: '#f59e0b20' }}
                                >
                                    <Icon icon="mdi:timer-sand" style={{ fontSize: '24px', color: '#f59e0b' }} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600">{getStatValue('pending')}</p>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                {formatCurrency(getTotalAmount('pending'), 'INR')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: '#ef444420' }}
                                >
                                    <Icon icon="mdi:close-circle" style={{ fontSize: '24px', color: '#ef4444' }} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm font-semibold mb-1">Failed</p>
                            <p className="text-3xl font-bold text-red-600">{getStatValue('failed')}</p>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                {formatCurrency(getTotalAmount('failed'), 'INR')}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: '#8b5cf620' }}
                                >
                                    <Icon icon="mdi:cash-refund" style={{ fontSize: '24px', color: '#8b5cf6' }} />
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm font-semibold mb-1">Refunds</p>
                            <p className="text-3xl font-bold text-purple-600">{getStatValue('refund')}</p>
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                {formatCurrency(getTotalAmount('refund'), 'INR')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters - Enhanced */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                    <Icon icon="mdi:filter-variant" style={{ fontSize: '20px', color: '#6b7280' }} />
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <Icon
                            icon="mdi:magnify"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            style={{ fontSize: '22px' }}
                        />
                        <input
                            type="text"
                            placeholder="Search transaction ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all appearance-none bg-white"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                        <option value="">All Status</option>
                        <option value="initiated">Initiated</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="refund">Refund</option>
                    </select>

                    <select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="initiated">Initiated</option>
                        <option value="pending">Pending</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="refund">Refund</option>
                    </select>

                    <select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all appearance-none bg-white"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                        <option value="">All Methods</option>
                        <option value="razorpay">Razorpay</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="paytm">Paytm</option>
                    </select>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                        placeholder="Start Date"
                    />

                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition-all"
                        placeholder="End Date"
                    />
                </div>

                <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <Icon icon="mdi:information-outline" style={{ fontSize: '18px', color: '#6b7280' }} />
                        <span>
                            Showing <span className="font-bold text-blue-600">{filteredTransactions.length}</span> of <span className="font-bold">{pagination.total}</span> transactions
                        </span>
                    </div>
                    {(statusFilter || paymentMethodFilter || searchTerm || startDate || endDate) && (
                        <button
                            onClick={() => {
                                setStatusFilter('');
                                setPaymentMethodFilter('');
                                setSearchTerm('');
                                setStartDate('');
                                setEndDate('');
                            }}
                        >
                            <Icon icon="mdi:close-circle" style={{ fontSize: '18px' }} />
                            <span>Clear Filters</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Transactions Table - Enhanced */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:receipt-text" style={{ fontSize: '18px' }} />
                                        Transaction
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:credit-card" style={{ fontSize: '18px' }} />
                                        Payment Method
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:cash" style={{ fontSize: '18px' }} />
                                        Amount
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:chart-donut" style={{ fontSize: '18px' }} />
                                        Status
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:calendar-clock" style={{ fontSize: '18px' }} />
                                        Date
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="mdi:account" style={{ fontSize: '18px' }} />
                                        User
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-800">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div
                                                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                                                style={{ backgroundColor: '#f3f4f6' }}
                                            >
                                                <Icon
                                                    icon="mdi:credit-card-off"
                                                    style={{ fontSize: '40px', color: '#9ca3af' }}
                                                />
                                            </div>
                                            <p className="text-gray-500 text-base font-medium">No transactions found</p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Try adjusting your filters or create a new transaction
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction._id}
                                        className="hover:bg-blue-50/30 transition-all duration-200 cursor-pointer border-b border-gray-50"
                                        onClick={() => handleViewDetails(transaction._id)}
                                    >
                                        <td className="px-6 py-5">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {transaction.transactionId}
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(transaction.transactionId);
                                                        }}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                        title="Copy Transaction ID"
                                                    >
                                                        <Icon icon="mdi:content-copy" style={{ fontSize: '14px', color: '#6b7280' }} />
                                                    </button>
                                                </div>
                                                {transaction.orderId?.orderNumber && (
                                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                                        <Icon icon="mdi:package-variant" style={{ fontSize: '14px' }} />
                                                        Order: {transaction.orderId.orderNumber}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm"
                                                    style={{
                                                        backgroundColor: `${getPaymentMethodColor(transaction.paymentMethod)}10`,
                                                        borderColor: `${getPaymentMethodColor(transaction.paymentMethod)}40`,
                                                    }}
                                                >
                                                    <Icon
                                                        icon={getPaymentMethodIcon(transaction.paymentMethod)}
                                                        style={{
                                                            fontSize: '22px',
                                                            color: getPaymentMethodColor(transaction.paymentMethod),
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-base font-bold text-gray-900 capitalize block">
                                                        {transaction.paymentMethod}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Gateway</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-lg font-bold text-gray-900">
                                                {formatCurrency(transaction.amount, transaction.currency)}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 font-medium">{transaction.currency}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl" style={{
                                                backgroundColor: `${getStatusColor(transaction.status)}15`,
                                            }}>
                                                <Icon
                                                    icon={getStatusIcon(transaction.status)}
                                                    style={{
                                                        fontSize: '20px',
                                                        color: getStatusColor(transaction.status),
                                                    }}
                                                />
                                                <span
                                                    className="text-sm font-bold capitalize"
                                                    style={{
                                                        color: getStatusColor(transaction.status),
                                                    }}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <Icon icon="mdi:calendar" style={{ fontSize: '16px', color: '#6b7280' }} />
                                                <p className="text-sm font-medium text-gray-900">{formatDate(transaction.createdAt)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                                                    {(transaction.userId?.name || 'N')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {transaction.userId?.name || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {transaction.userId?.email || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(transaction._id);
                                                    }}
                                                    className="p-2.5 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md border border-blue-200"
                                                    title="View Details"
                                                >
                                                    <Icon icon="mdi:eye" style={{ fontSize: '20px', color: '#3b82f6' }} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/edit-payment-transaction/${transaction._id}`);
                                                    }}
                                                    className="p-2.5 hover:bg-green-100 rounded-xl transition-all shadow-sm hover:shadow-md border border-green-200"
                                                    title="Edit Transaction"
                                                >
                                                    <Icon icon="mdi:pencil" style={{ fontSize: '20px', color: '#10b981' }} />
                                                </button>
                                                {transaction.status === 'success' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRefund(transaction._id);
                                                        }}
                                                        className="p-2.5 hover:bg-purple-100 rounded-xl transition-all shadow-sm hover:shadow-md border border-purple-200"
                                                        title="Initiate Refund"
                                                    >
                                                        <Icon icon="mdi:cash-refund" style={{ fontSize: '20px', color: '#8b5cf6' }} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.pages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
};

export default PaymentTransactionsListLayer;
