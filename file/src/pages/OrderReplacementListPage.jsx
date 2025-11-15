import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import OrderReplacementListLayer from '../components/OrderReplacementListLayer';

const OrderReplacementListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Order Replacements" />
            <OrderReplacementListLayer />
        </MasterLayout>
    );
};

export default OrderReplacementListPage;
