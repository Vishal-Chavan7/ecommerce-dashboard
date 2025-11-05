import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditSpecialPricingLayer from '../components/AddEditSpecialPricingLayer';

const AddSpecialPricingPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Special Pricing" />
            <AddEditSpecialPricingLayer />
        </MasterLayout>
    );
};

export default AddSpecialPricingPage;
