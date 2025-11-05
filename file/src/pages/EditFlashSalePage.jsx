import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditFlashSaleLayer from '../components/AddEditFlashSaleLayer';

const EditFlashSalePage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Edit Flash Sale" />
                <AddEditFlashSaleLayer />
            </MasterLayout>
        </>
    );
};

export default EditFlashSalePage;
