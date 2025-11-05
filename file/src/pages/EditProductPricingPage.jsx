import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductPricingLayer from '../components/AddEditProductPricingLayer';

const EditProductPricingPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Product Pricing" />
            <AddEditProductPricingLayer />
        </MasterLayout>
    );
};

export default EditProductPricingPage;
