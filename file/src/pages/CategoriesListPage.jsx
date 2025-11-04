import React from 'react'
import MasterLayout from '../masterLayout/MasterLayout'
import Breadcrumb from '../components/Breadcrumb'
import CategoriesListLayer from '../components/CategoriesListLayer'

const CategoriesListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title='Categories List' />
            <CategoriesListLayer />
        </MasterLayout>
    )
}

export default CategoriesListPage
