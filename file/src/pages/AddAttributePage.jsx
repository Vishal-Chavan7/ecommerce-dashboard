import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditAttributeLayer from '../components/AddEditAttributeLayer';

const AddAttributePage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Add Attribute"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Attributes', path: '/attributes-list' },
                    { name: 'Add Attribute', path: '/add-attribute' }
                ]}
            />
            <AddEditAttributeLayer />
        </MasterLayout>
    );
};

export default AddAttributePage;
