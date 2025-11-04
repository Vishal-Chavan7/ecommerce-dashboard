import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import BrandsListLayer from '../components/BrandsListLayer';

const BrandsListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb
                title="Brands Management"
                breadcrumbItems={[
                    { name: 'Dashboard', path: '/' },
                    { name: 'Brands', path: '/brands-list' }
                ]}
            />
            <BrandsListLayer />
        </MasterLayout>
    );
};

export default BrandsListPage;
