import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import OrderReturnListLayer from '../components/OrderReturnListLayer';

const OrderReturnListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Order Returns" />
            <OrderReturnListLayer />
        </MasterLayout>
    );
};

export default OrderReturnListPage;
