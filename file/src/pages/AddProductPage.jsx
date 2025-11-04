import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductLayer from '../components/AddEditProductLayer';

const AddProductPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Add New Product"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Products', path: '/products-list' },
                    { name: 'Add Product', path: '/add-product' }
                ]}
            />
            <AddEditProductLayer />
        </MasterLayout>
    );
};

export default AddProductPage;
