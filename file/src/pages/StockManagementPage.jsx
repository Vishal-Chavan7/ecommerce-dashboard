import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import StockManagementLayer from '../components/StockManagementLayer';

const StockManagementPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Stock Management" />
      <StockManagementLayer />
    </MasterLayout>
  );
};

export default StockManagementPage;
