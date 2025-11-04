import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

const CategoriesListLayer = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get("/admin/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            await api.delete(`/admin/categories/${id}`);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Failed to delete category");
        }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        try {
            await api.put(`/admin/categories/${id}`, { status: !currentStatus });
            toast.success("Status updated successfully");
            fetchCategories();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    // Build category tree structure
    const buildCategoryTree = (categories, parentId = null, level = 0) => {
        return categories
            .filter((cat) => {
                if (parentId === null) {
                    return cat.parentId === null || cat.parentId === undefined;
                }
                return cat.parentId === parentId;
            })
            .map((cat) => ({
                ...cat,
                level,
                children: buildCategoryTree(categories, cat._id, level + 1),
            }));
    };

    // Flatten tree for display
    const flattenTree = (tree, result = []) => {
        tree.forEach((node) => {
            result.push(node);
            if (node.children && node.children.length > 0) {
                flattenTree(node.children, result);
            }
        });
        return result;
    };

    const categoryTree = buildCategoryTree(categories);
    const flatCategories = flattenTree(categoryTree);

    // Filter categories based on search
    const filteredCategories = flatCategories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='card h-100 p-0 radius-12'>
            <div className='card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between'>
                <div className='d-flex align-items-center flex-wrap gap-3'>
                    <span className='text-md fw-medium text-secondary-light mb-0'>
                        Show
                    </span>
                    <select className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                    <form className='navbar-search'>
                        <input
                            type='text'
                            className='bg-base h-40-px w-auto'
                            name='search'
                            placeholder='Search'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Icon icon='ion:search-outline' className='icon' />
                    </form>
                </div>
                <Link
                    to='/add-category'
                    className='btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'
                >
                    <Icon
                        icon='ic:baseline-plus'
                        className='icon text-xl line-height-1'
                    />
                    Add Category
                </Link>
            </div>
            <div className='card-body p-24'>
                {loading ? (
                    <div className='text-center py-5'>
                        <div className='spinner-border text-primary' role='status'>
                            <span className='visually-hidden'>Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className='table-responsive scroll-sm'>
                        <table className='table bordered-table sm-table mb-0'>
                            <thead>
                                <tr>
                                    <th scope='col'>
                                        <div className='d-flex align-items-center gap-10'>
                                            <div className='form-check style-check d-flex align-items-center'>
                                                <input
                                                    className='form-check-input radius-4 border input-form-dark'
                                                    type='checkbox'
                                                    name='checkbox'
                                                />
                                            </div>
                                            S.L
                                        </div>
                                    </th>
                                    <th scope='col'>Category Name</th>
                                    <th scope='col'>Slug</th>
                                    <th scope='col'>Level</th>
                                    <th scope='col'>Sort Order</th>
                                    <th scope='col'>Featured</th>
                                    <th scope='col'>Status</th>
                                    <th scope='col' className='text-center'>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan='8' className='text-center py-4'>
                                            No categories found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category, index) => (
                                        <tr key={category._id}>
                                            <td>
                                                <div className='d-flex align-items-center gap-10'>
                                                    <div className='form-check style-check d-flex align-items-center'>
                                                        <input
                                                            className='form-check-input radius-4 border border-neutral-400'
                                                            type='checkbox'
                                                            name='checkbox'
                                                        />
                                                    </div>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td>
                                                <div className='d-flex align-items-center'>
                                                    {category.icon && (
                                                        <img
                                                            src={category.icon}
                                                            alt={category.name}
                                                            className='w-32-px h-32-px rounded-circle me-2'
                                                            onError={(e) => {
                                                                e.target.style.display = "none";
                                                            }}
                                                        />
                                                    )}
                                                    <span
                                                        style={{
                                                            marginLeft: `${category.level * 20}px`,
                                                        }}
                                                    >
                                                        {category.level > 0 && "└─ "}
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className='text-sm text-secondary-light'>
                                                    {category.slug}
                                                </span>
                                            </td>
                                            <td>
                                                <span className='badge bg-neutral-200 text-dark px-12 py-4 radius-4'>
                                                    Level {category.level}
                                                </span>
                                            </td>
                                            <td>
                                                <span className='text-sm'>{category.sortOrder}</span>
                                            </td>
                                            <td>
                                                {category.isFeatured ? (
                                                    <span className='badge bg-success-focus text-success-600 px-12 py-4 radius-4 fw-medium text-sm'>
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className='badge bg-neutral-200 text-secondary-light px-12 py-4 radius-4 fw-medium text-sm'>
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className={`badge ${category.status
                                                            ? "bg-success-focus text-success-600"
                                                            : "bg-danger-focus text-danger-600"
                                                        } px-12 py-4 radius-4 fw-medium text-sm border-0`}
                                                    onClick={() =>
                                                        handleStatusToggle(category._id, category.status)
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    {category.status ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className='text-center'>
                                                <div className='d-flex align-items-center gap-10 justify-content-center'>
                                                    <Link
                                                        to={`/edit-category/${category._id}`}
                                                        className='bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle'
                                                    >
                                                        <Icon
                                                            icon='lucide:edit'
                                                            className='menu-icon'
                                                        />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(category._id)}
                                                        className='bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0'
                                                    >
                                                        <Icon icon='mingcute:delete-2-line' />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className='card-footer border-top bg-base py-16 px-24 d-flex align-items-center justify-content-between flex-wrap gap-3'>
                <span className='text-sm fw-medium text-secondary-light mb-0'>
                    Showing {filteredCategories.length} of {categories.length} categories
                </span>
                <ul className='pagination d-flex flex-wrap align-items-center gap-2 justify-content-center'>
                    <li className='page-item'>
                        <a
                            className='page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md'
                            href='#'
                        >
                            <Icon icon='ep:d-arrow-left' />
                        </a>
                    </li>
                    <li className='page-item'>
                        <a
                            className='page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px bg-primary-600 text-white'
                            href='#'
                        >
                            1
                        </a>
                    </li>
                    <li className='page-item'>
                        <a
                            className='page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md'
                            href='#'
                        >
                            <Icon icon='ep:d-arrow-right' />
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default CategoriesListLayer;
