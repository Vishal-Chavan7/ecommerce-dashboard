import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditBrandLayer from '../components/AddEditBrandLayer';

const AddBrandPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Add New Brand"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Brands', path: '/brands-list' },
                    { name: 'Add Brand', path: '/add-brand' }
                ]}
            />
            <AddEditBrandLayer />
        </MasterLayout>
    );
};

export default AddBrandPage;
