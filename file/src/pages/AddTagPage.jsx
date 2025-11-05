import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditTagLayer from '../components/AddEditTagLayer';

const AddTagPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Add Tag" />
            <AddEditTagLayer />
        </MasterLayout>
    );
};

export default AddTagPage;
