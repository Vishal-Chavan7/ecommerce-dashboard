import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditOrderReplacementLayer from '../components/AddEditOrderReplacementLayer';

const AddOrderReplacementPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Order Replacement" />
            <AddEditOrderReplacementLayer />
        </MasterLayout>
    );
};

export default AddOrderReplacementPage;
