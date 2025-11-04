import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import AddEditCategoryLayer from '../components/AddEditCategoryLayer'

const EditCategoryPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title='Edit Category' />
            <AddEditCategoryLayer />
        </MasterLayout>
    )
}

export default EditCategoryPage
