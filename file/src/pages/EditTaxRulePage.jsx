import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import AddEditTaxRuleLayer from '../components/AddEditTaxRuleLayer';

const EditTaxRulePage = () => {
    return (
        <MasterLayout>
            <div className="page-breadcrumb d-none d-sm-flex align-items-center mb-3">
                <div className="breadcrumb-title pe-3">Tax Management</div>
                <div className="ps-3">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0 p-0">
                            <li className="breadcrumb-item">
                                <a href="/dashboard"><i className="bx bx-home-alt"></i></a>
                            </li>
                            <li className="breadcrumb-item">
                                <a href="/tax-rules-list">Tax Rules</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">Edit Tax Rule</li>
                        </ol>
                    </nav>
                </div>
            </div>
            <AddEditTaxRuleLayer />
        </MasterLayout>
    );
};

export default EditTaxRulePage;
