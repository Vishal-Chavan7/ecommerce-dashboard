import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductPricingLayer from '../components/AddEditProductPricingLayer';

const AddProductPricingPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Product Pricing" />
            <AddEditProductPricingLayer />
        </MasterLayout>
    );
};

export default AddProductPricingPage;
