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

  const [newImage, setNewImage] = useState({ url: '', alt: '' });
  const [editImage, setEditImage] = useState({ url: '', alt: '' });

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

  const handleAddImage = async (e) => {
    e.preventDefault();
    
    if (!newImage.url.trim()) {
      toast.error('Image URL is required');
      return;
    }

    try {
      await api.post(`/admin/gallery/product/${selectedProduct}`, newImage);
      toast.success('Image added successfully');
      setShowAddModal(false);
      setNewImage({ url: '', alt: '' });
      fetchGallery();
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error(error.response?.data?.message || 'Failed to add image');
    }
  };

  const handleEditImage = async (e) => {
    e.preventDefault();
    
    if (!editImage.url.trim()) {
      toast.error('Image URL is required');
      return;
    }

    try {
      await api.put(
        `/admin/gallery/product/${selectedProduct}/image/${editingIndex}`,
        editImage
      );
      toast.success('Image updated successfully');
      setShowEditModal(false);
      setEditingIndex(null);
      setEditImage({ url: '', alt: '' });
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
      url: gallery.images[index].url,
      alt: gallery.images[index].alt || '',
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
                        src={image.url}
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
                    setNewImage({ url: '', alt: '' });
                  }}
                />
              </div>
              <form onSubmit={handleAddImage}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Image URL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={newImage.url}
                      onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
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
                  {newImage.url && (
                    <div className="mb-3">
                      <label className="form-label">Preview</label>
                      <div className="border rounded p-2">
                        <img
                          src={newImage.url}
                          alt="Preview"
                          className="w-100"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=Invalid+URL';
                          }}
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
                      setNewImage({ url: '', alt: '' });
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
                    setEditImage({ url: '', alt: '' });
                  }}
                />
              </div>
              <form onSubmit={handleEditImage}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">
                      Image URL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={editImage.url}
                      onChange={(e) => setEditImage({ ...editImage, url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
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
                  {editImage.url && (
                    <div className="mb-3">
                      <label className="form-label">Preview</label>
                      <div className="border rounded p-2">
                        <img
                          src={editImage.url}
                          alt="Preview"
                          className="w-100"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300?text=Invalid+URL';
                          }}
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
                      setEditImage({ url: '', alt: '' });
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
