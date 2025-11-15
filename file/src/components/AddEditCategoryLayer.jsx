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

    // State for file upload
    const [iconFile, setIconFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [iconPreview, setIconPreview] = useState("");
    const [imagePreview, setImagePreview] = useState("");

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

        // Special handling for slug field - only lowercase letters and numbers
        if (name === "slug") {
            const sanitizedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ""); // Remove any character that's not a-z or 0-9
            setFormData((prev) => ({
                ...prev,
                slug: sanitizedSlug,
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

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

    // Handle file selection
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file");
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === "icon") {
                    setIconFile(file);
                    setIconPreview(reader.result);
                } else {
                    setImageFile(file);
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
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

            // Prepare FormData for file upload
            const submitData = new FormData();
            submitData.append("name", formData.name);
            submitData.append("slug", formData.slug);
            submitData.append("parentId", formData.parentId || "");
            submitData.append("level", formData.level);
            submitData.append("status", formData.status);
            submitData.append("sortOrder", formData.sortOrder);
            submitData.append("isFeatured", formData.isFeatured);
            submitData.append("metaTitle", formData.metaTitle);
            submitData.append("metaDescription", formData.metaDescription);

            // Handle icon file upload
            if (iconFile) {
                submitData.append("icon", iconFile);
            }

            // Handle image file upload
            if (imageFile) {
                submitData.append("image", imageFile);
            }

            if (isEditMode) {
                await api.put(`/admin/categories/${id}`, submitData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                toast.success("Category updated successfully");
            } else {
                await api.post("/admin/categories", submitData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
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
                                placeholder='categoryslug'
                                name='slug'
                                value={formData.slug}
                                onChange={handleChange}
                                pattern="[a-z0-9]+"
                                title="Only lowercase letters and numbers are allowed"
                                required
                            />
                            <small className='text-secondary-light d-block mt-1'>
                                Only lowercase letters and numbers (e.g., electronicsgadgets)
                            </small>
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

                        {/* Media */}
                        <div className='col-12 mt-4'>
                            <h6 className='text-md fw-semibold mb-3 border-bottom pb-2'>
                                Media
                            </h6>
                        </div>

                        {/* Icon Upload */}
                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Category Icon
                            </label>

                            <div className='upload-image-wrapper position-relative'>
                                <input
                                    type='file'
                                    className='form-control radius-8'
                                    accept='image/*'
                                    onChange={(e) => handleFileChange(e, "icon")}
                                />
                            </div>
                            {iconPreview && (
                                <div className='mt-3 text-center'>
                                    <img
                                        src={iconPreview}
                                        alt='Icon preview'
                                        className='w-64-px h-64-px rounded-circle object-fit-cover border'
                                    />
                                    <p className='text-sm text-secondary-light mt-2'>Icon Preview</p>
                                </div>
                            )}
                            <small className='text-secondary-light d-block mt-2'>
                                Supported: JPG, PNG, GIF, WEBP, SVG, AVIF (Max 5MB)
                            </small>
                        </div>

                        {/* Banner Image Upload */}
                        <div className='col-md-6'>
                            <label className='form-label fw-semibold text-primary-light text-sm mb-8'>
                                Banner Image
                            </label>

                            <div className='upload-image-wrapper position-relative'>
                                <input
                                    type='file'
                                    className='form-control radius-8'
                                    accept='image/*'
                                    onChange={(e) => handleFileChange(e, "image")}
                                />
                            </div>
                            {imagePreview && (
                                <div className='mt-3'>
                                    <img
                                        src={imagePreview}
                                        alt='Banner preview'
                                        className='w-100 rounded-8'
                                        style={{ maxHeight: "200px", objectFit: "cover" }}
                                    />
                                    <p className='text-sm text-secondary-light mt-2'>Banner Preview</p>
                                </div>
                            )}
                            <small className='text-secondary-light d-block mt-2'>
                                Supported: JPG, PNG, GIF, WEBP, SVG, AVIF (Max 5MB)
                            </small>
                        </div>

                        {/* Settings */}
                        <div className='col-12 mt-4'>
                            <h6 className='text-md fw-semibold mb-3 mt-10 border-bottom pb-2'>
                                Settings
                            </h6>
                        </div>

                        <div className='col-12'>
                            <div className='card border shadow-none radius-8 bg-neutral-50'>
                                <div className='card-body p-20'>
                                    <div className='d-flex align-items-center justify-content-between gap-4'>
                                        <div className='flex-grow-1 pe-3'>
                                            <label className='form-label fw-semibold text-neutral-900 mb-2 d-block'>
                                                Category Status
                                            </label>
                                            <p className='text-sm text-secondary-light mb-0 line-height-1-6'>
                                                {formData.status
                                                    ? 'This category is active and visible to customers'
                                                    : 'This category is inactive and hidden from customers'}
                                            </p>
                                        </div>
                                        <div className='d-flex align-items-center gap-3 flex-shrink-0'>
                                            <span className={`badge ${formData.status ? 'bg-success-600' : 'bg-neutral-400'} px-20 py-8 radius-4 fw-medium text-sm`}>
                                                {formData.status ? 'Active' : 'Inactive'}
                                            </span>
                                            <div className='form-check form-switch form-switch-lg m-0'>
                                                <input
                                                    className='form-check-input cursor-pointer shadow-none'
                                                    type='checkbox'
                                                    role='switch'
                                                    id='statusSwitch'
                                                    name='status'
                                                    checked={formData.status}
                                                    onChange={handleChange}
                                                    style={{ width: '52px', height: '28px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO */}
                        <div className='col-12 mt-4'>
                            <h6 className='text-md fw-semibold mb-3 mt-10 border-bottom pb-2'>
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
                        <div className='col-12 mt-20'>
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
