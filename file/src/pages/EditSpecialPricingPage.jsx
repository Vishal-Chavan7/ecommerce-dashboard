import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditSpecialPricingLayer from '../components/AddEditSpecialPricingLayer';

const EditSpecialPricingPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Special Pricing" />
            <AddEditSpecialPricingLayer />
        </MasterLayout>
    );
};

export default EditSpecialPricingPage;
