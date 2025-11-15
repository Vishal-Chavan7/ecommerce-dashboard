import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditOrderReturnLayer from '../components/AddEditOrderReturnLayer';

const EditOrderReturnPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Order Return" />
            <AddEditOrderReturnLayer />
        </MasterLayout>
    );
};

export default EditOrderReturnPage;
