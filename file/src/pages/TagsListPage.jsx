import React from 'react';
import MasterLayout from '../masterLayout/MasterLayout';
import Breadcrumb from '../components/Breadcrumb';
import TagsListLayer from '../components/TagsListLayer';

const TagsListPage = () => {
    return (
        <MasterLayout>
            <Breadcrumb title="Tags" />
            <TagsListLayer />
        </MasterLayout>
    );
};

export default TagsListPage;
