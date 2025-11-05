import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductFaqLayer from '../components/AddEditProductFaqLayer';

const EditProductFaqPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Product FAQ" />
            <AddEditProductFaqLayer />
        </MasterLayout>
    );
};

export default EditProductFaqPage;
