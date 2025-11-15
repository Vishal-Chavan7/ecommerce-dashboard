import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import PaymentTransactionsListLayer from '../components/PaymentTransactionsListLayer';

const PaymentTransactionsListPage = () => {
    return (
        <MasterLayout>
            <div className="mb-6">
                <nav className="flex items-center gap-2 text-sm text-gray-600">
                    <a href="/dashboard" className="hover:text-blue-600">
                        Dashboard
                    </a>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Payment Transactions</span>
                </nav>
            </div>
            <PaymentTransactionsListLayer />
        </MasterLayout>
    );
};

export default PaymentTransactionsListPage;
