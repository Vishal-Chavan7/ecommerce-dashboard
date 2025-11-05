import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditProductSeoLayer from '../components/AddEditProductSeoLayer';

const EditProductSeoPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Product SEO" />
            <AddEditProductSeoLayer />
        </MasterLayout>
    );
};

export default EditProductSeoPage;
