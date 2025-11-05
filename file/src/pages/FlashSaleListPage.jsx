import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import FlashSaleListLayer from '../components/FlashSaleListLayer';

const FlashSaleListPage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Flash Sales" />
                <FlashSaleListLayer />
            </MasterLayout>
        </>
    );
};

export default FlashSaleListPage;
