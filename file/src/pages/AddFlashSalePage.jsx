import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditFlashSaleLayer from '../components/AddEditFlashSaleLayer';

const AddFlashSalePage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Add Flash Sale" />
                <AddEditFlashSaleLayer />
            </MasterLayout>
        </>
    );
};

export default AddFlashSalePage;
