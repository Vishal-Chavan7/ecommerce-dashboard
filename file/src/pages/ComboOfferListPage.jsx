import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import ComboOfferListLayer from '../components/ComboOfferListLayer';

function ComboOfferListPage() {
    return (
        <MasterLayout>
            <div className="page-wrapper">
                <div className="page-content">
                    {/* Breadcrumb */}
                    <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                        <div className="breadcrumb-title pe-3">Pricing</div>
                        <div className="ps-3">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0 p-0">
                                    <li className="breadcrumb-item">
                                        <a href="/dashboard">
                                            <i className="bx bx-home-alt"></i>
                                        </a>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        Combo Offers
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                    {/* Main Content */}
                    <ComboOfferListLayer />
                </div>
            </div>
        </MasterLayout>
    );
}

export default ComboOfferListPage;
