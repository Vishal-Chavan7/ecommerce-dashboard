import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import ProductGalleryLayer from '../components/ProductGalleryLayer';

const ProductGalleryPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Product Gallery" />
      <ProductGalleryLayer />
    </MasterLayout>
  );
};

export default ProductGalleryPage;
