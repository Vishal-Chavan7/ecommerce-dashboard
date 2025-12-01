import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import UnifiedProductForm from '../components/UnifiedProductForm';

const EditProductPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Edit Product"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Products', path: '/products-list' },
                    { name: 'Edit Product', path: '#' }
                ]}
            />
            <UnifiedProductForm />
        </MasterLayout>
    );
};

export default EditProductPage;
