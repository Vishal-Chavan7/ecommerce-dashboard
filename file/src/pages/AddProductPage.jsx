import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import UnifiedProductForm from '../components/UnifiedProductForm';

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
            <UnifiedProductForm />
        </MasterLayout>
    );
};

export default AddProductPage;
