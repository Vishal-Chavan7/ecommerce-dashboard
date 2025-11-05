import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditBuyXGetYLayer from '../components/AddEditBuyXGetYLayer';

const AddBuyXGetYPage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Add Buy X Get Y Offer" />
                <AddEditBuyXGetYLayer />
            </MasterLayout>
        </>
    );
};

export default AddBuyXGetYPage;
