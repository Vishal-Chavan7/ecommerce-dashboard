import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api/axios";

const AddEditCategoryLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        parentId: "",
        level: 0,
        icon: "",
        image: "",
        status: true,
        sortOrder: 0,
        isFeatured: false,
        metaTitle: "",
        metaDescription: "",
    });

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await api.get("/admin/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/categories/${id}`);
            const category = response.data;
            setFormData({
                name: category.name || "",
                slug: category.slug || "",
                parentId: category.parentId || "",
                level: category.level || 0,
                icon: category.icon || "",
                image: category.image || "",
                status: category.status !== undefined ? category.status : true,
                sortOrder: category.sortOrder || 0,
                isFeatured: category.isFeatured || false,
                metaTitle: category.metaTitle || "",
                metaDescription: category.metaDescription || "",
            });
        } catch (error) {
            console.error("Error fetching category:", error);
            toast.error("Failed to load category");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Auto-generate slug from name
        if (name === "name" && !isEditMode) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }

        // Update level based on parent selection
        if (name === "parentId") {
            const parentCategory = categories.find((cat) => cat._id === value);
            const newLevel = parentCategory ? parentCategory.level + 1 : 0;
            setFormData((prev) => ({
                ...prev,
                level: newLevel,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.slug) {
            toast.error("Name and slug are required");
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                parentId: formData.parentId || null,
            };

            if (isEditMode) {
                await api.put(`/admin/categories/${id}`, submitData);
                toast.success("Category updated successfully");
            } else {
                await api.post("/admin/categories", submitData);
                toast.success("Category created successfully");
            }
            navigate("/categories-list");
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error(
                error.response?.data?.message || "Failed to save category"
            );
        } finally {
            setLoading(false);
        }
    };

    // Build category tree for parent selection (exclude current category and its children)
    const buildParentOptions = (categories, excludeId = null) => {
        const filtered = categories.filter((cat) => cat._id !== excludeId);

        const buildTree = (parentId = null, level = 0) => {
            return filtered
                .filter((cat) => {
                    if (parentId === null) {
                        return cat.parentId === null || cat.parentId === undefined;
                    }
                    return cat.parentId === parentId;
                })
                .map((cat) => ({
                    ...cat,
                    level,
                    children: buildTree(cat._id, level + 1),
                }));
        };

        const flattenTree = (tree, result = []) => {
            tree.forEach((node) => {
                result.push(node);
                if (node.children && node.children.length > 0) {
                    flattenTree(node.children, result);
                }
            });
            return result;
        };

        const tree = buildTree();
        return flattenTree(tree);
    };

    const parentOptions = buildParentOptions(categories, id);

    if (loading && isEditMode) {
        return (
            <div className='text-center py-5'>
                <div className='spinner-border text-primary' role='status'>
                    <span className='visually-hidden'>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='card h-100 p-0 radius-12'>
            <div className='card-header border-bottom bg-base py-16 px-24'>
                <h6 className='text-lg fw-semibold mb-0'>
                    {isEditMode ? "Edit Category" : "Add New Category"}
                </h6>
            </div>
            <div className='card-body p-24'>
                <form onSubmit={handleSubmit}>
                    <div className='row gy-3'>
                        {/* Basic Information */}
                        <div className='col-12'>
                            <h6 className='text-md fw-semibold mb-3 border-bottom pb-2'>
                                Basic Information
                            </h6>
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Category Name <span className='text-danger-600'>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control radius-8'
                                placeholder='Enter category name'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Slug <span className='text-danger-600'>*</span>
                            </label>
                            <input
                                type='text'
                                className='form-control radius-8'
                                placeholder='category-slug'
                                name='slug'
                                value={formData.slug}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Parent Category
                            </label>
                            <select
                                className='form-select radius-8'
                                name='parentId'
                                value={formData.parentId}
                                onChange={handleChange}
                            >
                                <option value=''>None (Root Category)</option>
                                {parentOptions.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {"—".repeat(cat.level)} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Level (Auto-calculated)
                            </label>
                            <input
                                type='number'
                                className='form-control radius-8 bg-neutral-50'
                                name='level'
                                value={formData.level}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Sort Order
                            </label>
                            <input
                                type='number'
                                className='form-control radius-8'
                                placeholder='0'
                                name='sortOrder'
                                value={formData.sortOrder}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Media */}
                        <div className='col-12 mt-4'>
                            <h6 className='text-md fw-semibold mb-3 border-bottom pb-2'>
                                Media
                            </h6>
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Icon URL
                            </label>
                            <input
                                type='url'
                                className='form-control radius-8'
                                placeholder='https://cdn.com/icons/category-icon.png'
                                name='icon'
                                value={formData.icon}
                                onChange={handleChange}
                            />
                            {formData.icon && (
                                <img
                                    src={formData.icon}
                                    alt='Icon preview'
                                    className='mt-2 w-32-px h-32-px rounded-circle'
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            )}
                        </div>

                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Banner Image URL
                            </label>
                            <input
                                type='url'
                                className='form-control radius-8'
                                placeholder='https://cdn.com/banners/category.jpg'
                                name='image'
                                value={formData.image}
                                onChange={handleChange}
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt='Image preview'
                                    className='mt-2 w-100 rounded-8'
                                    style={{ maxHeight: "200px", objectFit: "cover" }}
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            )}
                        </div>

                        {/* Settings */}
                        <div className='col-12 mt-4'>
                            <h6 className='text-md fw-semibold mb-3 border-bottom pb-2'>
                                Settings
                            </h6>
                        </div>

                        <div className='col-md-4'>
                            <div className='form-check form-switch'>
                                <input
                                    className='form-check-input'
                                    type='checkbox'
                                    id='statusSwitch'
                                    name='status'
                                    checked={formData.status}
                                    onChange={handleChange}
                                />
                                <label className='form-check-label' htmlFor='statusSwitch'>
                                    Active Status
                                </label>
                            </div>
                        </div>

                        <div className='col-md-4'>
                            <div className='form-check form-switch'>
                                <input
                                    className='form-check-input'
                                    type='checkbox'
                                    id='featuredSwitch'
                                    name='isFeatured'
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                />
                                <label className='form-check-label' htmlFor='featuredSwitch'>
                                    Featured on Home
                                </label>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className='col-12 mt-4'>
                            <h6 className='text-md fw-semibold mb-3 border-bottom pb-2'>
                                SEO Information
                            </h6>
                        </div>

                        <div className='col-12'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Meta Title
                            </label>
                            <input
                                type='text'
                                className='form-control radius-8'
                                placeholder='Best Electronics Online'
                                name='metaTitle'
                                value={formData.metaTitle}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='col-12'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Meta Description
                            </label>
                            <textarea
                                className='form-control radius-8'
                                rows='3'
                                placeholder='Buy latest electronics online...'
                                name='metaDescription'
                                value={formData.metaDescription}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className='col-12 mt-4'>
                            <div className='d-flex align-items-center gap-3'>
                                <button
                                    type='submit'
                                    className='btn btn-primary-600 radius-8 px-20 py-11'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className='spinner-border spinner-border-sm me-2'
                                                role='status'
                                                aria-hidden='true'
                                            ></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Icon icon='ic:baseline-check' className='me-1' />
                                            {isEditMode ? "Update Category" : "Create Category"}
                                        </>
                                    )}
                                </button>
                                <Link
                                    to='/categories-list'
                                    className='btn btn-outline-secondary radius-8 px-20 py-11'
                                >
                                    <Icon icon='ic:baseline-arrow-back' className='me-1' />
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditCategoryLayer;
