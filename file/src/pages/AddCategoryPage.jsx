import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AddEditCategoryLayer from '../components/AddEditCategoryLayer'

const AddCategoryPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title='Add Category' />
      <AddEditCategoryLayer />
    </MasterLayout>
  )
}

export default AddCategoryPage
