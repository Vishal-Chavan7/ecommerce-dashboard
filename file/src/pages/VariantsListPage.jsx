import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import VariantsListLayer from '../components/VariantsListLayer';

const VariantsListPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Product Variants" />
      <VariantsListLayer />
    </MasterLayout>
  );
};

export default VariantsListPage;
