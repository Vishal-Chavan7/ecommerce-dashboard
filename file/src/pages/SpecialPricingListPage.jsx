import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import SpecialPricingListLayer from '../components/SpecialPricingListLayer';

const SpecialPricingListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Special Pricing List" />
            <SpecialPricingListLayer />
        </MasterLayout>
    );
};

export default SpecialPricingListPage;
