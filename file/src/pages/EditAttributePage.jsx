import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditAttributeLayer from '../components/AddEditAttributeLayer';

const EditAttributePage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Edit Attribute"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Attributes', path: '/attributes-list' },
                    { name: 'Edit Attribute', path: '#' }
                ]}
            />
            <AddEditAttributeLayer />
        </MasterLayout>
    );
};

export default EditAttributePage;
