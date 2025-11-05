import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductSeoLayer from '../components/AddEditProductSeoLayer';

const AddProductSeoPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Product SEO" />
            <AddEditProductSeoLayer />
        </MasterLayout>
    );
};

export default AddProductSeoPage;
