import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TagsListLayer = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/tags');
            setTags(response.data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/admin/tags/${deleteId}`);
            toast.success('Tag deleted successfully');
            setShowDeleteModal(false);
            setDeleteId(null);
            fetchTags();
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Failed to delete tag');
        }
    };

    const handleStatusToggle = async (tag) => {
        try {
            const updatedTag = { ...tag, status: !tag.status };
            await api.put(`/admin/tags/${tag._id}`, updatedTag);
            toast.success('Tag status updated');
            fetchTags();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="card">
            <div className="card-header">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="card-title mb-0">Tags List</h5>
                        <span className="badge text-sm fw-semibold text-primary-600 bg-primary-100 px-20 py-9 radius-4">
                            {filteredTags.length} {filteredTags.length === 1 ? 'Tag' : 'Tags'}
                        </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <div className="icon-field">
                            <input
                                type="text"
                                className="form-control form-control-sm w-auto"
                                placeholder="Search tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="icon">
                                <Icon icon="ion:search-outline" />
                            </span>
                        </div>
                        <button
                            className="btn btn-primary-600 d-flex align-items-center gap-2"
                            onClick={() => navigate('/add-tag')}
                        >
                            <Icon icon="ic:baseline-plus" className="text-xl" />
                            Add New Tag
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary-600" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : filteredTags.length === 0 ? (
                    <div className="text-center py-5">
                        <Icon icon="solar:tag-bold-duotone" className="text-64 text-primary-light mb-16" />
                        <p className="text-secondary-light">
                            {searchTerm ? 'No tags found matching your search' : 'No tags found. Create your first tag!'}
                        </p>
                        {!searchTerm && (
                            <button
                                className="btn btn-primary-600 mt-3"
                                onClick={() => navigate('/add-tag')}
                            >
                                <Icon icon="ic:baseline-plus" className="me-2" />
                                Add First Tag
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table bordered-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" />
                                        </div>
                                    </th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Slug</th>
                                    <th scope="col">Status</th>
                                    <th scope="col" className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTags.map((tag) => (
                                    <tr key={tag._id}>
                                        <td>
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <Icon
                                                    icon="solar:tag-bold-duotone"
                                                    className="text-xl text-primary-600"
                                                />
                                                <span className="text-sm fw-semibold text-secondary-light">
                                                    {tag.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge text-sm fw-semibold text-info-600 bg-info-100 px-20 py-9 radius-4">
                                                {tag.slug}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="form-switch switch-primary d-flex align-items-center gap-3">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    checked={tag.status}
                                                    onChange={() => handleStatusToggle(tag)}
                                                />
                                                <span className={`text-sm fw-semibold ${tag.status ? 'text-success-600' : 'text-secondary-light'}`}>
                                                    {tag.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary-600 me-2"
                                                onClick={() => navigate(`/edit-tag/${tag._id}`)}
                                                title="Edit"
                                            >
                                                <Icon icon="lucide:edit" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger-600"
                                                onClick={() => {
                                                    setDeleteId(tag._id);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Delete"
                                            >
                                                <Icon icon="fluent:delete-24-regular" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <Icon icon="material-symbols:warning" className="text-warning-600 text-64 mb-3" />
                                </div>
                                <p className="text-center mb-3">
                                    Are you sure you want to delete this tag?
                                </p>
                                <div className="alert alert-warning d-flex align-items-center gap-2 mb-0">
                                    <Icon icon="material-symbols:info" className="text-warning-600 text-xl" />
                                    <span className="text-sm">
                                        This will remove the tag from all associated products.
                                    </span>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary-600"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger-600"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TagsListLayer;
