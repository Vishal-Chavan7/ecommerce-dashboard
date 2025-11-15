import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditOrderReturnLayer from '../components/AddEditOrderReturnLayer';

const AddOrderReturnPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Order Return" />
            <AddEditOrderReturnLayer />
        </MasterLayout>
    );
};

export default AddOrderReturnPage;
