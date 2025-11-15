import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import AddEditPaymentMethodLayer from '../components/AddEditPaymentMethodLayer';

const EditPaymentMethodPage = () => {
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
                                    <li className="breadcrumb-item">
                                        <a href="/payment-methods">Payment Methods</a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Edit Payment Method
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* End Breadcrumb */}

                    <AddEditPaymentMethodLayer />
                </div>
            </div>
        </MasterLayout>
    );
};

export default EditPaymentMethodPage;
