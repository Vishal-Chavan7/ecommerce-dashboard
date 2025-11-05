import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditTagLayer from '../components/AddEditTagLayer';

const EditTagPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Edit Tag" />
            <AddEditTagLayer />
        </MasterLayout>
    );
};

export default EditTagPage;
