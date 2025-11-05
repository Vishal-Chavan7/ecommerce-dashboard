import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import BuyXGetYListLayer from '../components/BuyXGetYListLayer';

const BuyXGetYListPage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Buy X Get Y" />
                <BuyXGetYListLayer />
            </MasterLayout>
        </>
    );
};

export default BuyXGetYListPage;
