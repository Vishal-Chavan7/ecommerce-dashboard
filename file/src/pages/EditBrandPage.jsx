import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditBrandLayer from '../components/AddEditBrandLayer';

const EditBrandPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Edit Brand"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Brands', path: '/brands-list' },
                    { name: 'Edit Brand', path: '#' }
                ]}
            />
            <AddEditBrandLayer />
        </MasterLayout>
    );
};

export default EditBrandPage;
