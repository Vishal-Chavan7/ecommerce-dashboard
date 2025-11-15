import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import ViewPaymentTransactionLayer from '../components/ViewPaymentTransactionLayer';

const ViewPaymentTransactionPage = () => {
    return (
        <MasterLayout>
            <div className="mb-6">
                <nav className="flex items-center gap-2 text-sm text-gray-600">
                    <a href="/dashboard" className="hover:text-blue-600">
                        Dashboard
                    </a>
                    <span>/</span>
                    <a href="/payment-transactions" className="hover:text-blue-600">
                        Payment Transactions
                    </a>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Transaction Details</span>
                </nav>
            </div>
            <ViewPaymentTransactionLayer />
        </MasterLayout>
    );
};

export default ViewPaymentTransactionPage;
