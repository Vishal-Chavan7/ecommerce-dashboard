import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import ShippingRuleListLayer from '../components/ShippingRuleListLayer';

function ShippingRuleListPage() {
    return (
        <MasterLayout>
            <div className="page-wrapper">
                <div className="page-content">
                    {/* Breadcrumb */}
                    <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                        <div className="breadcrumb-title pe-3">Shipping</div>
                        <div className="ps-3">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0 p-0">
                                    <li className="breadcrumb-item">
                                        <a href="/dashboard">
                                            <i className="bx bx-home-alt"></i>
                                        </a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Shipping Rules
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* Main Content */}
                    <ShippingRuleListLayer />
                </div>
            </div>
        </MasterLayout>
    );
}

export default ShippingRuleListPage;
