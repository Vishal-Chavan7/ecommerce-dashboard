import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AttributesListLayer from '../components/AttributesListLayer';

const AttributesListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Attributes & Filters"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Attributes', path: '/attributes-list' }
                ]}
            />
            <AttributesListLayer />
        </MasterLayout>
    );
};

export default AttributesListPage;
