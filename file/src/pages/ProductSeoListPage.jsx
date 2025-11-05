import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ProductSeoListLayer from '../components/ProductSeoListLayer';

const ProductSeoListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Product SEO" />
            <ProductSeoListLayer />
        </MasterLayout>
    );
};

export default ProductSeoListPage;
