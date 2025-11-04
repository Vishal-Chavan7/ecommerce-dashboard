import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import AddEditVariantLayer from '../components/AddEditVariantLayer';

const AddVariantPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Add Product Variant" />
      <AddEditVariantLayer />
    </MasterLayout>
  );
};

export default AddVariantPage;
