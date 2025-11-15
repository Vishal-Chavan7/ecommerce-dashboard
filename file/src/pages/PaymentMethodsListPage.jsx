import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import PaymentMethodsListLayer from '../components/PaymentMethodsListLayer';

const PaymentMethodsListPage = () => {
    return (
        <MasterLayout>
            <div className="page-wrapper">
                <div className="page-content">
                    {/* Breadcrumb */}
                    <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                        <div className="breadcrumb-title pe-3">Payment</div>
                        <div className="ps-3">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0 p-0">
                                    <li className="breadcrumb-item">
                                        <a href="/">
                                            <i className="bx bx-home-alt"></i>
                                        </a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Payment Methods
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* End Breadcrumb */}

                    <PaymentMethodsListLayer />
                </div>
            </div>
        </MasterLayout>
    );
};

export default PaymentMethodsListPage;
