import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import AddEditPaymentTransactionLayer from '../components/AddEditPaymentTransactionLayer';

const EditPaymentTransactionPage = () => {
    return (
        <MasterLayout>
            <div className="page-wrapper">
                <div className="page-content">
                    {/* Breadcrumb */}
                    <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                        <div className="breadcrumb-title pe-3">Payment Transactions</div>
                        <div className="ps-3">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0 p-0">
                                    <li className="breadcrumb-item">
                                        <a href="/">
                                            <i className="bx bx-home-alt"></i>
                                        </a>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <a href="/payment-transactions">Payment Transactions</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Edit Transaction
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* End Breadcrumb */}

                    <AddEditPaymentTransactionLayer />
                </div>
            </div>
        </MasterLayout>
    );
};

export default EditPaymentTransactionPage;
