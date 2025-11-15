import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ViewOrderReturnLayer from '../components/ViewOrderReturnLayer';

const ViewOrderReturnPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="View Order Return" />
            <ViewOrderReturnLayer />
        </MasterLayout>
    );
};

export default ViewOrderReturnPage;
