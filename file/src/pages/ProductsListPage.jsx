import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ProductsListLayer from '../components/ProductsListLayer';

const ProductsListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Products Management"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Products', path: '/products-list' }
                ]}
            />
            <ProductsListLayer />
        </MasterLayout>
    );
};

export default ProductsListPage;
