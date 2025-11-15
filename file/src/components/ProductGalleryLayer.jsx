import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import api from '../api/axios';

const ProductGalleryLayer = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [newImage, setNewImage] = useState({ file: null, alt: '', preview: '' });
  const [editImage, setEditImage] = useState({ file: null, alt: '', preview: '', existingUrl: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchGallery();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/gallery/product/${selectedProduct}`);
      setGallery(response.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP, SVG, AVIF)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isEdit) {
        setEditImage(prev => ({ ...prev, file, preview: reader.result }));
      } else {
        setNewImage(prev => ({ ...prev, file, preview: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();

    if (!newImage.file) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', newImage.file);
      formData.append('alt', newImage.alt);

      await api.post(`/admin/gallery/product/${selectedProduct}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Image added successfully');
      setShowAddModal(false);
      setNewImage({ file: null, alt: '', preview: '' });
      fetchGallery();
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error(error.response?.data?.message || 'Failed to add image');
    }
  };

  const handleEditImage = async (e) => {
    e.preventDefault();

    // If no new file and no existing URL, show error
    if (!editImage.file && !editImage.existingUrl) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      if (editImage.file) {
        formData.append('image', editImage.file);
      }
      formData.append('alt', editImage.alt);

      await api.put(
        `/admin/gallery/product/${selectedProduct}/image/${editingIndex}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Image updated successfully');
      setShowEditModal(false);
      setEditingIndex(null);
      setEditImage({ file: null, alt: '', preview: '', existingUrl: '' });
      fetchGallery();
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error(error.response?.data?.message || 'Failed to update image');
    }
  };

  const handleDeleteImage = async () => {
    try {
      await api.delete(
        `/admin/gallery/product/${selectedProduct}/image/${deleteIndex}`
      );
      toast.success('Image deleted successfully');
      setShowDeleteModal(false);
      setDeleteIndex(null);
      fetchGallery();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setEditImage({
      file: null,
      alt: gallery.images[index].alt || '',
      preview: '',
      existingUrl: gallery.images[index].url,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const getProductName = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.title : 'Unknown Product';
  };

  // Helper function to get full image URL
  const getImageUrl = (url) => {
    if (!url) return '';
    // If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative path, prepend the API base URL
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const serverURL = baseURL.replace('/api', ''); // Remove /api to get server root
    return `${serverURL}${url}`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-3">Product Gallery Management</h5>
        <div className="d-flex flex-wrap align-items-center gap-3">
          <select
            className="form-select w-auto"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">Select a Product</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.title}
              </option>
            ))}
          </select>
          {selectedProduct && (
            <button
              className="btn btn-primary-600 d-flex align-items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Icon icon="ic:baseline-plus" className="text-xl" />
              Add Image
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        {!selectedProduct ? (
          <div className="text-center py-5">
            <Icon icon="solar:gallery-bold-duotone" className="text-64 text-primary-light mb-16" />
            <p className="text-secondary-light">Select a product to manage its gallery</p>
          </div>
        ) : loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary-600" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : !gallery || gallery.images.length === 0 ? (
          <div className="text-center py-5">
            <Icon icon="solar:gallery-bold-duotone" className="text-64 text-primary-light mb-16" />
            <p className="text-secondary-light mb-3">No images in gallery</p>
            <button
              className="btn btn-outline-primary-600"
              onClick={() => setShowAddModal(true)}
            >
              Add First Image
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-sm text-secondary-light">
                <strong>Product:</strong> {getProductName(gallery.productId)} |
                <strong className="ms-2">Total Images:</strong> {gallery.images.length}
              </p>
            </div>
            <div className="row g-3">
              {gallery.images.map((image, index) => (
                <div key={index} className="col-md-4 col-lg-3">
                  <div className="card border">
                    <div className="position-relative" style={{ paddingTop: '100%' }}>
                      <img
                        src={getImageUrl(image.url)}
                        alt={image.alt || `Image ${index + 1}`}
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    <div className="card-body p-2">
                      <p className="text-xs text-secondary-light mb-1">
                        <strong>Alt:</strong> {image.alt || 'No alt text'}
                      </p>
                      <div className="d-flex gap-1 mt-2">
                        <button
                          className="btn btn-sm btn-outline-primary-600 flex-grow-1"
                          onClick={() => openEditModal(index)}
                          title="Edit"
                        >
                          <Icon icon="lucide:edit" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger-600 flex-grow-1"
                          onClick={() => openDeleteModal(index)}
                          title="Delete"
                        >
                          <Icon icon="fluent:delete-24-regular" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Image Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Image</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewImage({ file: null, alt: '', preview: '' });
                  }}
                />
              </div>
              <form onSubmit={handleAddImage}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Image File <span className="text-danger">*</span>
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/avif"
                      onChange={(e) => handleFileChange(e, false)}
                      required
                    />
                    <small className="text-muted">Allowed: JPEG, PNG, GIF, WEBP, SVG, AVIF (Max: 5MB)</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alt Text (SEO)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newImage.alt}
                      onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                      placeholder="e.g., Front View, Product Detail"
                    />
                    <small className="text-muted">SEO-friendly description for the image</small>
                  </div>
                  {newImage.preview && (
                    <div className="mb-3">
                      <label className="form-label">Preview</label>
                      <div className="border rounded p-2">
                        <img
                          src={newImage.preview}
                          alt="Preview"
                          className="w-100"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary-600"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewImage({ file: null, alt: '', preview: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-600">
                    Add Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Image</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingIndex(null);
                    setEditImage({ file: null, alt: '', preview: '', existingUrl: '' });
                  }}
                />
              </div>
              <form onSubmit={handleEditImage}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Current Image</label>
                    <div className="border rounded p-2 mb-2">
                      <img
                        src={getImageUrl(editImage.existingUrl)}
                        alt="Current"
                        className="w-100"
                        style={{ maxHeight: '150px', objectFit: 'contain' }}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Replace Image (Optional)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/avif"
                      onChange={(e) => handleFileChange(e, true)}
                    />
                    <small className="text-muted">Leave empty to keep current image. Allowed: JPEG, PNG, GIF, WEBP, SVG, AVIF (Max: 5MB)</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alt Text (SEO)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editImage.alt}
                      onChange={(e) => setEditImage({ ...editImage, alt: e.target.value })}
                      placeholder="e.g., Front View, Product Detail"
                    />
                    <small className="text-muted">SEO-friendly description for the image</small>
                  </div>
                  {editImage.preview && (
                    <div className="mb-3">
                      <label className="form-label">New Image Preview</label>
                      <div className="border rounded p-2">
                        <img
                          src={editImage.preview}
                          alt="Preview"
                          className="w-100"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary-600"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingIndex(null);
                      setEditImage({ file: null, alt: '', preview: '', existingUrl: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-600">
                    Update Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                    setDeleteIndex(null);
                  }}
                />
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this image? This action cannot be undone.</p>
                {gallery && gallery.images[deleteIndex] && (
                  <div className="border rounded p-2 mt-3">
                    <img
                      src={gallery.images[deleteIndex].url}
                      alt={gallery.images[deleteIndex].alt}
                      className="w-100"
                      style={{ maxHeight: '150px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary-600"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteIndex(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger-600"
                  onClick={handleDeleteImage}
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

export default ProductGalleryLayer;
