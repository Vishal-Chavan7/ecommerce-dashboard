import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditVariantLayer from '../components/AddEditVariantLayer';

const EditVariantPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Edit Product Variant" />
      <AddEditVariantLayer />
    </MasterLayout>
  );
};

export default EditVariantPage;
