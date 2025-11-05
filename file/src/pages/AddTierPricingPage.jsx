import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditTierPricingLayer from '../components/AddEditTierPricingLayer';

const AddTierPricingPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Tier Pricing" />
            <AddEditTierPricingLayer />
        </MasterLayout>
    );
};

export default AddTierPricingPage;
