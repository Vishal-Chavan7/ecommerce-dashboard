import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ProductPricingListLayer from '../components/ProductPricingListLayer';

const ProductPricingListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Product Pricing" />
            <ProductPricingListLayer />
        </MasterLayout>
    );
};

export default ProductPricingListPage;
