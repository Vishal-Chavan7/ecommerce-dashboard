import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditOrderReplacementLayer from '../components/AddEditOrderReplacementLayer';

const EditOrderReplacementPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Order Replacement" />
            <AddEditOrderReplacementLayer />
        </MasterLayout>
    );
};

export default EditOrderReplacementPage;
