import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductFaqLayer from '../components/AddEditProductFaqLayer';

const AddProductFaqPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Product FAQ" />
            <AddEditProductFaqLayer />
        </MasterLayout>
    );
};

export default AddProductFaqPage;
