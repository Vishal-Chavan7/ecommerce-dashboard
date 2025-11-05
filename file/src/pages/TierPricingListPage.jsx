import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import TierPricingListLayer from '../components/TierPricingListLayer';

const TierPricingListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Tier Pricing List" />
            <TierPricingListLayer />
        </MasterLayout>
    );
};

export default TierPricingListPage;
