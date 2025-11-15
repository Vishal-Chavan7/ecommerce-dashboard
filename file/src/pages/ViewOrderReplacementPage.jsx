import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ViewOrderReplacementLayer from '../components/ViewOrderReplacementLayer';

const ViewOrderReplacementPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="View Order Replacement" />
            <ViewOrderReplacementLayer />
        </MasterLayout>
    );
};

export default ViewOrderReplacementPage;
