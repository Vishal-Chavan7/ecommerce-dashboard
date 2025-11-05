import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditBuyXGetYLayer from '../components/AddEditBuyXGetYLayer';

const EditBuyXGetYPage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Edit Buy X Get Y Offer" />
                <AddEditBuyXGetYLayer />
            </MasterLayout>
        </>
    );
};

export default EditBuyXGetYPage;
