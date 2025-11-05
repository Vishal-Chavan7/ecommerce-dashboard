import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ProductFaqsListLayer from '../components/ProductFaqsListLayer';

const ProductFaqsListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Product FAQs" />
            <ProductFaqsListLayer />
        </MasterLayout>
    );
};

export default ProductFaqsListPage;
