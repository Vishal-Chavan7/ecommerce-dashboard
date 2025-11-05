import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditTierPricingLayer from '../components/AddEditTierPricingLayer';

const EditTierPricingPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Tier Pricing" />
            <AddEditTierPricingLayer />
        </MasterLayout>
    );
};

export default EditTierPricingPage;
